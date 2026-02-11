import type { jsPDF } from 'jspdf';

export type LogoStyle = 'minimal' | 'organic' | 'badge';

/**
 * Draws the NutriFlow branding header on the PDF document.
 * @param doc The jsPDF instance
 * @param style Selected logo style ('minimal', 'organic', 'badge')
 * @param title Page title (e.g. "Shopping List")
 * @param subtitle Optional subtitle (e.g. Week date)
 */
export const drawPdfHeader = (doc: jsPDF, style: LogoStyle = 'organic', title: string, subtitle?: string) => {
    // Background Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    switch (style) {
        case 'minimal':
            drawMinimalLogo(doc);
            break;
        case 'organic':
            drawOrganicLogo(doc);
            break;
        case 'badge':
            drawBadgeLogo(doc);
            break;
    }

    // Title Positioning
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(title, 195, 22, { align: 'right' });

    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFont("helvetica", "normal");
        doc.text(subtitle, 195, 30, { align: 'right' });
    }
};

/**
 * Option 1: Modern & Clean (Typography heavy with accent line)
 */
const drawMinimalLogo = (doc: jsPDF) => {
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("NUTRIFLOW", 20, 26);

    // Accent Line
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(1.5);
    doc.line(20, 30, 58, 30);

    // Small Tagline
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("SMART NUTRITION", 20, 35);
};

/**
 * Option 2: Organic Fork (Refined Fork + Leaf)
 */
const drawOrganicLogo = (doc: jsPDF) => {
    // Fork Handle
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(28, 16, 4, 16, 1, 1, 'F');

    // Fork Head Base (Custom Path)
    doc.setFillColor(255, 255, 255);
    doc.path([
        { op: 'm', c: [26, 16] },
        { op: 'c', c: [26, 26, 34, 26, 34, 16] }, // Curve bottom
        { op: 'l', c: [34, 10] },
        { op: 'l', c: [32, 10] },
        { op: 'l', c: [32, 15] },
        { op: 'l', c: [31, 15] },
        { op: 'l', c: [31, 10] },
        { op: 'l', c: [29, 10] },
        { op: 'l', c: [29, 15] },
        { op: 'l', c: [28, 15] },
        { op: 'l', c: [28, 10] },
        { op: 'l', c: [26, 10] }, // Left side
        { op: 'h', c: [] }
    ], 'F');

    // Leaf Accent (Green Circle)
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.circle(36, 12, 3, 'F');

    // Text
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("NUTRIFLOW", 45, 25);
};

/**
 * Option 3: Tech Badge (Shield Style)
 * Improved implementation using standard shapes for reliability
 */
const drawBadgeLogo = (doc: jsPDF) => {
    const primaryColor = [16, 185, 129]; // Emerald-500


    // 1. Draw Shield Background (Composed of a Rect + Triangle for stability)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    // Top Square part
    doc.rect(28, 12, 14, 10, 'F');
    // Bottom Triangle points
    doc.triangle(28, 22, 42, 22, 35, 32, 'F');

    // 2. Inner Detail (Subtle border/inset)
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    // Draw a line to accentuate the top
    doc.line(28, 12, 42, 12);

    // 3. Initials "NF" (NutriFlow)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("courier", "bold");
    // Center text visually in the shield
    doc.text("NF", 35, 23, { align: 'center' });

    // 4. Main Brand Text
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("NUTRIFLOW", 48, 25);
};
