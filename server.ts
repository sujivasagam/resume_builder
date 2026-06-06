/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink, Bookmark, InternalHyperlink, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { resumeData } from "./src/resumeData";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // Helper to lazily initialize or obtain Gemini client safely
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to use AI features.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // AI Resume Tailoring Endpoint
  app.post("/api/tailor", async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobDescription, focus } = req.body;

      if (!jobDescription || typeof jobDescription !== "string") {
        res.status(400).json({ error: "jobDescription is required and must be a string." });
        return;
      }

      const ai = getGeminiClient();

      const systemInstruction = `
        You are an expert executive resume writing assistant and matching engine.
        Your task is to analyze M. Sujitha's professional resume against a provided job description.
        You must evaluate the alignment score (0 to 100), identify matching strengths and skill gaps, 
        craft a customized headline and executive summary, recommend which specific projects to highlight with matching angles, 
        and write a high-impact cover letter.

        Sujitha's Resume Context:
        - 13+ years of total software experience. Evolved from lead PHP/web developer into Technical Project Manager.
        - Deep certifications: Google Project Management Specialization, 10+ Google and IBM AI / Generative AI courses.
        - Experience: 
          * BrainCert (Jan 2021 - Present): Project Manager (5.5 yrs) leading 10+ people, improving delivery efficiency by 20-25%. Managed unified SaaS classroom / virtual whiteboard platform.
          * BrainCert Project Lead/Team Lead (1.5 yrs): managed code reviews, database optimization, MySQL.
          * Senior PHP Developer and Project Lead across multiple solutions: Laravel (4.2-5.3), CodeIgniter, Slim PHP UI integrations, API engineering.

        Guidelines:
        1. Emphasize how her technical developer background (PHP, Laravel, databases) makes her an exceptional TECHNICAL Project Manager or Tech Lead who understands development realities.
        2. Leverage her strong GenAI credentials (Google & IBM prompt engineering Certifications) for modern, AI-aware setups.
        3. Keep the tone executive, confident, pragmatic, and professional.
      `;

      const prompt = `
        Analyze this Job Description:
        "${jobDescription.slice(0, 15000)}"

        Target Focus Area requested by user: ${focus || "balanced"}

        Please provide a structured analysis in JSON matching the exact schema specified.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "score",
              "strengths",
              "gaps",
              "tailoredHeadline",
              "tailoredSummary",
              "highlightedProjects",
              "coverLetter",
              "interviewPrep",
            ],
            properties: {
              score: {
                type: Type.INTEGER,
                description: "Alignment score from 0 (no match) to 100 (perfect matches) based on skills and experience fit.",
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 to 4 core strengths of Sujitha that fit the job description.",
              },
              gaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "1 to 2 acceptable gaps / development areas (e.g., specific framework differences) framed as things she is familiar with or can adapt quickly.",
              },
              tailoredHeadline: {
                type: Type.STRING,
                description: "A tailored, optimized headline matching her profile to the job (e.g. 'Technical Project Manager | Scalable Web Solutions | AI Integration').",
              },
              tailoredSummary: {
                type: Type.STRING,
                description: "A tailored 3-sentence professional summary for her resume highlighting relevant experience.",
              },
              highlightedProjects: {
                type: Type.ARRAY,
                description: "Recommend 2-3 specific projects from her resume that have high overlap, with a sentence explaining the matching angle.",
                items: {
                  type: Type.OBJECT,
                  required: ["projectId", "projectName", "matchingAngle"],
                  properties: {
                    projectId: { type: Type.STRING, description: "e.g. 'proj-1', 'proj-2', 'proj-3'" },
                    projectName: { type: Type.STRING },
                    matchingAngle: { type: Type.STRING, description: "How this project specifically proves her capabilities requested in the job description." },
                  },
                },
              },
              coverLetter: {
                type: Type.STRING,
                description: "A professional, personalized 3-paragraph cover letter directed at the hiring team.",
              },
              interviewPrep: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 highly actionable talking points they can reference during her interview based on this role.",
              },
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from AI engine");
      }

      res.status(200).json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("AI Tailor Error:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during analysis." });
    }
  });

  // DOCX Export Endpoint
  app.get("/api/download/docx", async (req: Request, res: Response) => {
    try {
      const tailoredHeadline = (req.query.headline as string) || resumeData.headline;
      const tailoredSummary = (req.query.summary as string) || resumeData.summary;
      const themeParam = (req.query.theme as string) || "slate";
      const layoutParam = (req.query.layout as string) || "interactive";

      // Setup dynamic theme colors matching the app's visual identities
      let primaryColor = "1F2937";     // Slate-800 Dark Solid Primary
      let accentColor = "0F766E";      // Teal accent
      let secondaryColor = "4B5563";   // Slate-600 Secondary text
      let lineDividerColor = "E5E7EB"; // Light line border
      let sidebarBgColor = "F8FAFC";   // Sidebar subtle bg (slate-50)
      let fontName = "Arial";          // Default Sans

      if (themeParam === "emerald") {
        primaryColor = "064E40";     // Emerald-900 / Forest
        accentColor = "0D9488";      // Teal Accent
        secondaryColor = "374151";   // Gray-700 / Tech Dark text
        lineDividerColor = "D1FAE5"; // Emerald hint line
        sidebarBgColor = "EDF5F2";   // Soft teal hint background
        fontName = "Arial";
      } else if (themeParam === "crimson") {
        primaryColor = "4C0519";     // Burgundy / Crimson Elite
        accentColor = "BE123C";      // Vibrant Rich Rose accent
        secondaryColor = "44403C";   // Stone-700 warm dark text
        lineDividerColor = "FECDD3"; // Soft crimson line
        sidebarBgColor = "F5F1EA";   // Warm Ivory sidebar background
        fontName = "Georgia";        // Elegant Serif Font
      }

      // Construct the absolute live application URL dynamically (supports dev/prod preview URLs)
      const host = req.get("host") || "localhost:3000";
      const proto = req.headers["x-forwarded-proto"] || "https";
      const baseUrl = `${proto}://${host}/`;

      // ----------------------------------------------------
      // PATHWAY A: CLASSIC-SPLIT (TWO-COLUMN COLUMNAR SIDEBAR)
      // ----------------------------------------------------
      
      // Left sidebar cell children
      const leftChildren: any[] = [];

      // 1. Initials banner
      leftChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({
              text: "M. SUJITHA",
              bold: true,
              size: 20, // 10pt
              font: fontName,
              color: primaryColor,
            }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "PM & ARCHITECT",
              bold: true,
              size: 13, // 6.5pt
              font: fontName,
              color: accentColor,
            }),
          ]
        })
      );

      // 2. CONTACT DETAILS
      leftChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: "CONTACT DETAILS",
              bold: true,
              size: 15,
              font: fontName,
              color: primaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: "____________________________",
              size: 10,
              font: fontName,
              color: lineDividerColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `📧 ${resumeData.contact.email}`,
              size: 14,
              font: fontName,
              color: secondaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `📞 ${resumeData.contact.phone}`,
              size: 14,
              font: fontName,
              color: secondaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `📍 Coimbatore, India`,
              size: 14,
              font: fontName,
              color: secondaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: "LinkedIn Profile",
              size: 14,
              font: fontName,
              color: accentColor,
              underline: { type: "single" },
            })
          ]
        })
      );

      // 3. PM COMPETENCIES
      leftChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: "PM COMPETENCIES",
              bold: true,
              size: 15,
              font: fontName,
              color: primaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: "____________________________",
              size: 10,
              font: fontName,
              color: lineDividerColor,
            })
          ]
        }),
        ...resumeData.topSkills.slice(0, 7).map(sk => new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: sk,
              size: 14,
              font: fontName,
              color: secondaryColor,
            })
          ]
        }))
      );

      // 4. TECH STACKS
      leftChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: "BACKEND STACKS",
              bold: true,
              size: 15,
              font: fontName,
              color: primaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: "____________________________",
              size: 10,
              font: fontName,
              color: lineDividerColor,
            })
          ]
        }),
        ...resumeData.backendSkills.slice(0, 8).map(sk => new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: sk,
              size: 14,
              font: fontName,
              color: secondaryColor,
            })
          ]
        }))
      );

      // 5. EDUCATION
      leftChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: "EDUCATION",
              bold: true,
              size: 15,
              font: fontName,
              color: primaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: "____________________________",
              size: 10,
              font: fontName,
              color: lineDividerColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: "Master of Computer Applications",
              bold: true,
              size: 14,
              font: fontName,
              color: secondaryColor,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: "Anna University | 2009",
              size: 13,
              font: fontName,
              color: secondaryColor,
              italics: true,
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: "MCA Score: 75%",
              bold: true,
              size: 13,
              font: fontName,
              color: primaryColor,
            })
          ]
        })
      );

      // Right main column children
      const rightChildren: any[] = [];

      rightChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: resumeData.name.toUpperCase(),
              bold: true,
              size: 26, // 13pt
              font: fontName,
              color: primaryColor,
            }),
          ]
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: tailoredHeadline,
              bold: true,
              size: 18,
              font: fontName,
              color: accentColor,
            })
          ]
        })
      );

      // Helper function to create clean right headers with lines resembling printing layout
      function createRightSectionHeader(title: string) {
        const borderStyle = {
          slate: BorderStyle.SINGLE,
          emerald: BorderStyle.DASHED,
          crimson: BorderStyle.DOUBLE,
        }[themeParam] || BorderStyle.SINGLE;

        const borderSize = {
          slate: 8,
          emerald: 6,
          crimson: 18,
        }[themeParam] || 8;

        return [
          new Paragraph({
            spacing: { before: 200, after: 80 },
            border: {
              bottom: {
                style: borderStyle,
                size: borderSize,
                color: accentColor,
                space: 4,
              }
            },
            children: [
              new TextRun({
                text: title.toUpperCase(),
                bold: true,
                size: 18, // 9pt
                font: fontName,
                color: primaryColor,
              })
            ]
          })
        ];
      }

      // Summary profile
      rightChildren.push(
        ...createRightSectionHeader("Professional Profile"),
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: tailoredSummary,
              size: 18, // 9pt
              font: fontName,
              color: secondaryColor,
            })
          ]
        })
      );

      // Experience timeline
      rightChildren.push(
        ...createRightSectionHeader("Professional Experience Timeline"),
        ...resumeData.experience.slice(0, 3).flatMap(exp => {
          const blocks = [
            new Paragraph({
              spacing: { before: 100, after: 30 },
              children: [
                new TextRun({
                  text: `${exp.role.toUpperCase()} ∙ ${exp.company.toUpperCase()}`,
                  bold: true,
                  size: 18,
                  font: fontName,
                  color: primaryColor,
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `${exp.period} (${exp.duration})  |  ${exp.location}`,
                  size: 15,
                  italics: true,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            })
          ];

          exp.highlights.slice(0, 3).forEach(hl => {
            blocks.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: hl,
                    size: 17,
                    font: fontName,
                    color: secondaryColor,
                  })
                ]
              })
            );
          });

          return blocks;
        })
      );

      // Projects spotlight
      rightChildren.push(
        ...createRightSectionHeader("Key Enterprise Projects Completed"),
        ...resumeData.projects.slice(0, 3).flatMap(p => {
          return [
            new Paragraph({
              spacing: { before: 80, after: 30 },
              children: [
                new TextRun({
                  text: p.name,
                  bold: true,
                  size: 17,
                  font: fontName,
                  color: primaryColor,
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 45 },
              children: [
                new TextRun({
                  text: `Tech Stack: ${p.techStack.join(", ")}`,
                  bold: true,
                  size: 15,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: p.description,
                  size: 16,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            })
          ];
        })
      );

      // Certifications list
      rightChildren.push(
        ...createRightSectionHeader("Verified Certifications Spotlight"),
        ...resumeData.certifications.slice(0, 4).map(cert => {
          return new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: `${cert.name} - ${cert.issuer} (${cert.date})`,
                size: 16,
                font: fontName,
                color: secondaryColor,
              })
            ]
          });
        })
      );

      const leftCell = new TableCell({
        width: {
          size: 31,
          type: WidthType.PERCENTAGE,
        },
        shading: {
          fill: sidebarBgColor,
        },
        margins: {
          top: 360,
          bottom: 360,
          left: 200,
          right: 200,
        },
        children: leftChildren,
      });

      const rightCell = new TableCell({
        width: {
          size: 69,
          type: WidthType.PERCENTAGE,
        },
        margins: {
          top: 360,
          bottom: 360,
          left: 300,
          right: 200,
        },
        children: rightChildren,
      });

      const masterTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        rows: [
          new TableRow({
            children: [leftCell, rightCell],
          }),
        ],
      });

      // ----------------------------------------------------
      // PATHWAY B: MINIMAL LAYOUT (SINGLE COLUMN RESPONSIVE)
      // ----------------------------------------------------
      const standardChildren: any[] = [];

      // 1. Centered Header
      standardChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: resumeData.name.toUpperCase(),
              bold: true,
              size: 32, // 16pt
              font: fontName,
              color: primaryColor,
            }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: tailoredHeadline,
              bold: true,
              size: 19, // 9.5pt
              font: fontName,
              color: accentColor,
            }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Email: ${resumeData.contact.email}   |   Phone: ${resumeData.contact.phone}   |   Location: Coimbatore, India`,
              size: 16, // 8pt
              font: fontName,
              color: secondaryColor,
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: `LinkedIn Profile: ${resumeData.contact.linkedin}   |   Live Portfolio: `,
              size: 16, // 8pt
              font: fontName,
              color: secondaryColor,
            }),
            new ExternalHyperlink({
              link: baseUrl,
              children: [
                new TextRun({
                  text: "Web Resume ↗",
                  size: 16,
                  font: fontName,
                  color: accentColor,
                  underline: { type: "single" },
                })
              ]
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "_________________________________________________________________________________",
              size: 10,
              font: fontName,
              color: lineDividerColor,
            })
          ]
        })
      );

      // 2. Executive Profile Section
      standardChildren.push(
        createStandardSectionHeader("Professional Profile"),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: tailoredSummary,
              size: 18, // 9pt
              font: fontName,
              color: secondaryColor,
            })
          ]
        })
      );

      // Helper function to create standard competency grid cells for the 3 columns
      function createCompCell(title: string, list: string[]) {
        const borderStyle = {
          slate: BorderStyle.SINGLE,
          emerald: BorderStyle.DASHED,
          crimson: BorderStyle.SINGLE,
        }[themeParam] || BorderStyle.SINGLE;

        const borderSize = themeParam === "emerald" ? 6 : 8;

        return new TableCell({
          width: {
            size: 33,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: sidebarBgColor,
          },
          borders: {
            top: { style: borderStyle, size: borderSize, color: lineDividerColor },
            bottom: { style: borderStyle, size: borderSize, color: lineDividerColor },
            left: { style: borderStyle, size: borderSize, color: lineDividerColor },
            right: { style: borderStyle, size: borderSize, color: lineDividerColor },
          },
          margins: {
            top: 144,
            bottom: 144,
            left: 144,
            right: 144,
          },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 80 },
              border: {
                bottom: {
                  style: themeParam === "emerald" ? BorderStyle.DASHED : themeParam === "crimson" ? BorderStyle.DOUBLE : BorderStyle.SINGLE,
                  size: themeParam === "crimson" ? 12 : 6,
                  color: lineDividerColor,
                  space: 4,
                }
              },
              children: [
                new TextRun({
                  text: title.toUpperCase(),
                  bold: true,
                  size: 15,
                  font: fontName,
                  color: primaryColor,
                })
              ]
            }),
            ...list.map(item => new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: item,
                  size: 15,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            }))
          ]
        });
      }

      // Helper function to create clean standard headers for classic-minimal with native theme lines
      function createStandardSectionHeader(title: string) {
        const borderStyle = {
          slate: BorderStyle.SINGLE,
          emerald: BorderStyle.DASHED,
          crimson: BorderStyle.DOUBLE,
        }[themeParam] || BorderStyle.SINGLE;

        const borderSize = {
          slate: 8,
          emerald: 6,
          crimson: 18,
        }[themeParam] || 8;

        return new Paragraph({
          spacing: { before: 240, after: 125 },
          border: {
            bottom: {
              style: borderStyle,
              size: borderSize,
              color: accentColor,
              space: 4,
            }
          },
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              size: 20, // 10pt
              font: fontName,
              color: primaryColor,
            })
          ]
        });
      }

      // 3. Competencies Checklist Table in 1-column layout
      standardChildren.push(
        createStandardSectionHeader("Expertise & Technical Frameworks"),
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "auto" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
            left: { style: BorderStyle.NONE, size: 0, color: "auto" },
            right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
          },
          rows: [
            new TableRow({
              children: [
                createCompCell("PM Frameworks", [
                  "Agile/Scrum Models",
                  "Sprint Estimating",
                  "Backlog Grooming",
                  "Risk Management",
                  "Milestone Tracking",
                  "Team Facilitation"
                ]),
                createCompCell("Backend stacks", [
                  "PHP Enterprise",
                  "Laravel MVC",
                  "CodeIgniter",
                  "Slim PHP REST",
                  "MySQL Architectures",
                  "APIs & Webhooks"
                ]),
                createCompCell("Emerging & AI", [
                  "Generative AI SDLC",
                  "Prompt Engineering",
                  "Prompt Architecting",
                  "AI automation flows"
                ])
              ]
            })
          ]
        }),
        new Paragraph({ spacing: { after: 180 } }) // post-table spacer
      );

      // 4. Experience timeline
      standardChildren.push(
        createStandardSectionHeader("Chronological Work Experience"),
        ...resumeData.experience.flatMap((exp) => {
          const blocks = [
            new Paragraph({
              spacing: { before: 120, after: 40 },
              children: [
                new TextRun({
                  text: `${exp.role.toUpperCase()}  ∙  ${exp.company.toUpperCase()}`,
                  bold: true,
                  size: 18,
                  font: fontName,
                  color: primaryColor,
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `${exp.period} (${exp.duration})   |   ${exp.location}`,
                  size: 15,
                  italics: true,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            })
          ];

          exp.highlights.forEach((hl) => {
            blocks.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: hl,
                    size: 18,
                    font: fontName,
                    color: secondaryColor,
                  })
                ]
              })
            );
          });

          return blocks;
        })
      );

      // 5. Enterprise Projects
      standardChildren.push(
        createStandardSectionHeader("Key Projects Spotlights"),
        ...resumeData.projects.flatMap((p) => {
          return [
            new Paragraph({
              spacing: { before: 100, after: 30 },
              children: [
                new TextRun({
                  text: p.name,
                  bold: true,
                  size: 18,
                  font: fontName,
                  color: primaryColor,
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `Tech Stack: ${p.techStack.join(", ")}  |  Database Engine: ${p.database || "MySQL"}`,
                  bold: true,
                  size: 15,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: p.description,
                  size: 18,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            }),
            ...p.relevance.map(rel => new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `Delivery Impact: ${rel}`,
                  size: 17,
                  italics: true,
                  font: fontName,
                  color: secondaryColor,
                })
              ]
            }))
          ];
        })
      );

      // 6. Certifications
      standardChildren.push(
        createStandardSectionHeader("Acquired Certifications"),
        ...resumeData.certifications.map((cert) => {
          const runChildren: any[] = [
            new TextRun({
              text: `${cert.name}  -  ${cert.issuer} (${cert.date})`,
              bold: true,
              size: 17,
              font: fontName,
              color: secondaryColor,
            })
          ];
          if (cert.credentialId) {
            runChildren.push(
              new TextRun({
                text: ` (ID: ${cert.credentialId})`,
                size: 15,
                italics: true,
                font: fontName,
                color: secondaryColor,
              })
            );
          }
          return new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: runChildren,
          });
        })
      );

      // 7. Educational Background
      standardChildren.push(
        createStandardSectionHeader("Academic Background"),
        ...resumeData.education.map((edu) => {
          return new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({
                text: `${edu.degree}  -  ${edu.school}`,
                bold: true,
                size: 18,
                font: fontName,
                color: primaryColor,
              }),
              new TextRun({
                text: ` (${edu.period})   |   Honors rank score: ${edu.score}`,
                size: 16,
                italics: true,
                font: fontName,
                color: secondaryColor,
              })
            ]
          });
        })
      );

      // Select dynamic layout structure based on request parameters
      let sectionChildren: any[] = [];
      if (layoutParam === "classic-split" || layoutParam === "interactive") {
        sectionChildren = [masterTable];
      } else {
        sectionChildren = standardChildren;
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720,    // 0.5 inch margins matching visual PDF layout tightly
                  bottom: 720,
                  left: 720,
                  right: 720,
                }
              }
            },
            children: sectionChildren,
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", "attachment; filename=Sujitha_Manivasagam_Resume.docx");
      res.send(buffer);
    } catch (err: any) {
      console.error("Failed to generate DOCX file:", err);
      res.status(500).json({ error: "Failed to generate DOCX file: " + err.message });
    }
  });

  // Health endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", time: new Date() });
  });

  // Serve static assets
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode. Serving static assets.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
