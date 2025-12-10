import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse/lib/pdf-parse.js");
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// Define the schema for the output
const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        score: z.number().describe("A score from 0 to 100 representing the fit"),
        skillsMatch: z.array(z.string()).describe("List of skills present in both JD and CV"),
        missingSkills: z.array(z.string()).describe("List of skills present in JD but missing in CV"),
        rewrittenCV: z.string().describe("An ATS-optimized professional summary and experience metrics based on the JD"),
        ethicalInsights: z.object({
            biasCheck: z.string().describe("Analysis of potential bias in the input documents or the match result. e.g. 'No gendered language detected'"),
            tokenUsage: z.number().describe("Estimated token count used for this analysis"),
        }),
    })
);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const jdText = formData.get("jdText") as string;
        const cvFile = formData.get("cvFile") as File;

        // Read Headers
        const provider = req.headers.get("x-provider") || "openai";
        const apiKey = req.headers.get("x-api-key");
        const modelName = req.headers.get("x-model-name") || (provider === "google" ? "gemini-1.5-flash" : "gpt-3.5-turbo");

        if (!jdText || !cvFile) {
            return NextResponse.json(
                { error: "Missing Job Description or CV file" },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing API Key" },
                { status: 401 }
            );
        }

        // 1. Parsing CV
        const arrayBuffer = await cvFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let cvText = "";
        try {
            const pdfData = await pdf(buffer);
            cvText = pdfData.text;
            // Truncate
            cvText = cvText.slice(0, 3000);
        } catch (error) {
            console.error("PDF Error", error);
            return NextResponse.json(
                { error: "Failed to parse PDF file" },
                { status: 500 }
            );
        }

        // 2. LangChain Initialization (Multi-Provider)
        let model;

        if (provider === "google") {
            model = new ChatGoogleGenerativeAI({
                apiKey: apiKey,
                model: modelName,
                temperature: 0,
                maxOutputTokens: 2048
            });
        } else {
            model = new ChatOpenAI({
                openAIApiKey: apiKey,
                modelName: modelName,
                temperature: 0,
            });
        }

        const formatInstructions = parser.getFormatInstructions();

        const prompt = new PromptTemplate({
            template: `
        You are an expert ATS (Applicant Tracking System) and Career Coach. 
        Analyze the following Job Description and Candidate CV.
        
        Job Description:
        {jdText}

        Candidate CV:
        {cvText}

        Task:
        1. Identify key skills in the JD and check if the CV has them.
        2. Calculate a match score (0-100) based on skills and experience relevance.
        3. Rewrite a professional summary and key bullets for the CV to better match the JD keywords (ATS Optimization).
        4. Perform an Ethical AI check: Look for discriminatory language in the JD or CV (gender, age, race bias) and report findings.
        5. Estimate the tokens used in this transaction roughly.

        {format_instructions}
      `,
            inputVariables: ["jdText", "cvText"],
            partialVariables: { formatInstructions },
        });

        const input = await prompt.format({
            jdText: jdText.slice(0, 3000), // Truncate to be safe
            cvText: cvText,
        });

        const response = await model.invoke(input);
        const result = await parser.parse(response.content as string);

        // LangChain's ChatOpenAI doesn't always return token usage in the content, 
        // so we trust the model's estimation if it put it in the JSON, or we mock it if it failed.
        if (!result.ethicalInsights.tokenUsage) {
            result.ethicalInsights.tokenUsage = Math.ceil((jdText.length + cvText.length) / 4);
        }

        return NextResponse.json({
            score: result.score,
            matchDetails: {
                skillsMatch: result.skillsMatch,
                missingSkills: result.missingSkills,
                roleFit: result.score > 70 ? "High" : "Moderate"
            },
            rewrittenCV: result.rewrittenCV,
            ethicalInsights: result.ethicalInsights
        });

    } catch (error: any) {
        console.error("API Error:", error);

        // Handle OpenAI specific errors
        if (error?.status === 401) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        return NextResponse.json(
            { error: "Analysis failed. Please try again." },
            { status: 500 }
        );
    }
}
