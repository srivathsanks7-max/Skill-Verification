import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Lazy-load pdf2json to avoid Vercel bundler issues with native modules
    const PDFParser = (await import('pdf2json')).default;

    const pdfText = await new Promise<string>((resolve, reject) => {
      // @ts-ignore - pdf2json types are inconsistent
      const pdfParser = new PDFParser(null, true);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        try {
          resolve(decodeURIComponent(pdfParser.getRawTextContent()));
        } catch {
          resolve(pdfParser.getRawTextContent());
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });
    
    return NextResponse.json({ text: pdfText });
  } catch (error: any) {
    console.error('PDF Parse Error:', error);
    return NextResponse.json({ error: 'Failed to parse PDF: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
