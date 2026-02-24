import { NextResponse } from 'next/server';

interface FireCall {
  time: string;
  code: string;
  type: string;
  address: string;
  units: string;
  district: string;
}

const MDFR_URL = 'https://www.miamidade.gov/firecad/calls_include.asp';

// Cache for 30 seconds to avoid hammering the source
let cache: { data: FireCall[]; ts: number } = { data: [], ts: 0 };
const CACHE_TTL = 30_000;

export async function GET() {
  const now = Date.now();
  if (cache.data.length > 0 && now - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(MDFR_URL, {
      headers: {
        'User-Agent': 'DADE-OS/0.1 (civic-data-dashboard)',
      },
    });

    if (!res.ok) {
      return NextResponse.json(cache.data.length > 0 ? cache.data : [], { status: 200 });
    }

    const html = await res.text();
    const calls = parseFireCAD(html);

    cache = { data: calls, ts: now };
    return NextResponse.json(calls);
  } catch {
    // Return cached data or empty array on failure
    return NextResponse.json(cache.data.length > 0 ? cache.data : [], { status: 200 });
  }
}

function parseFireCAD(html: string): FireCall[] {
  const calls: FireCall[] = [];
  let currentDistrict = '';

  // Split by lines and parse the table structure
  const lines = html.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect district headers
    const districtMatch = line.match(/<b>\s*(NORTH|SOUTH|CENTRAL|EAST|LOCAL|OTHER)\s*<\/b>/i);
    if (districtMatch) {
      currentDistrict = districtMatch[1].toUpperCase();
      continue;
    }

    // Detect table rows with call data — look for rows with multiple <td> tags
    if (line.includes('<td') && !line.includes('<th')) {
      // Collect the full row (may span multiple lines)
      let rowHtml = line;
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('</tr>')) {
        rowHtml += ' ' + lines[j].trim();
        j++;
      }
      if (j < lines.length) {
        rowHtml += ' ' + lines[j].trim();
      }

      // Extract all <td> cell contents
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let match;
      while ((match = cellRegex.exec(rowHtml)) !== null) {
        // Strip HTML tags and clean whitespace
        const text = match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        cells.push(text);
      }

      // MDFR CAD table has 5 columns: RCVD, FC, INC TYPE, ADDRESS, UNITS
      if (cells.length >= 5 && cells[0].match(/\d{1,2}:\d{2}/)) {
        calls.push({
          time: cells[0],
          code: cells[1],
          type: cells[2],
          address: cells[3],
          units: cells[4],
          district: currentDistrict,
        });
      }

      i = j; // skip past the rows we consumed
    }
  }

  return calls;
}
