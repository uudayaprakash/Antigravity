import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse/lib/pdf-parse.js");

// Define response types
export interface AnalysisResponse {
    score: number;
    matchDetails: {
        skillsMatch: string[];
        missingSkills: string[];
        roleFit: string;
    };
    rewrittenCV: string;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const jdText = formData.get("jdText") as string;
        const cvFile = formData.get("cvFile") as File;

        if (!jdText || !cvFile) {
            return NextResponse.json(
                { error: "Missing Job Description or CV file" },
                { status: 400 }
            );
        }

        // 1. Parsing CV (Real PDF Extraction)
        // Convert File to Buffer
        const arrayBuffer = await cvFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let cvText = "";
        try {
            const pdfData = await pdf(buffer);
            cvText = pdfData.text;
        } catch (error) {
            console.error("PDF Parse Error:", error);
            return NextResponse.json(
                { error: "Failed to parse PDF file" },
                { status: 500 }
            );
        }

        // 2. AI Simulation (Mock Logic based on simple keyword matching for demo)
        // In a real app, we would send `jdText` and `cvText` to an LLM.

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simple keyword extraction for "Mock" intelligence
        // We'll scan the JD for capitalized words (pseudo-skills) and check if they exist in CV
        const jdWords = jdText.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
        const uniqueJdSkills = Array.from(new Set(jdWords)).filter(w => w.length > 2);

        const matched: string[] = [];
        const missing: string[] = [];

        uniqueJdSkills.forEach(skill => {
            if (cvText.includes(skill)) {
                matched.push(skill);
            } else {
                missing.push(skill);
            }
        });

        // Calculate dummy score
        let calculatedScore = 0;
        if (uniqueJdSkills.length > 0) {
            calculatedScore = Math.round((matched.length / uniqueJdSkills.length) * 100);
        }
        // Boost score for realism if it's too low (since keyword matching is naive)
        calculatedScore = Math.max(calculatedScore, 65);

        // Mock Rewritten CV
        const rewrittenCV = `
# Optimized CV for ${uniqueJdSkills[0] || "Target Role"}

## Profile
Results-oriented professional with strong experience in ${matched.slice(0, 3).join(", ") || "software development"}. 
Proven track record of delivering high-quality solutions.

## Core Skills
${matched.concat(missing.slice(0, 2)).join(" • ")}

## Professional Experience
**Candidate's Previous Role**
* Leveraged ${matched[0] || "skills"} to improve system performance.
* Implemented solutions using ${matched[1] || "technology"}, resulting in efficiency gains.
* Addressed requirements for ${missing[0] || "new technologies"} by rapid upskilling.

(Note: This is an AI-generated optimization based on the JD requirements.)
    `.trim();


        const response: AnalysisResponse = {
            score: calculatedScore,
            matchDetails: {
                skillsMatch: matched.slice(0, 8), // Limit for UI
                missingSkills: missing.slice(0, 5),
                roleFit: "High",
            },
            rewrittenCV: rewrittenCV,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
