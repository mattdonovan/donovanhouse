// Turn a 16:9 presentation PDF into magazine spreads for the site.
//
// Usage (from the site/ folder):
//   swift scripts/pdf-to-spreads.swift "path/to/Presentation.pdf" public/projects/<project-id>
//
// Writes, for every page:
//   spread-01.jpg     ~2048px wide (full-size reader)
//   spread-01-sm.jpg  ~1024px wide (project list flip-through)
//
// Uses macOS PDFKit, so it needs a Mac with the Xcode Command Line Tools
// (macOS offers to install them the first time you run `git` or `swift`).

import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  FileHandle.standardError.write("Usage: swift scripts/pdf-to-spreads.swift <file.pdf> <output-folder>\n".data(using: .utf8)!)
  exit(1)
}
let outDir = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

func render(_ page: PDFPage, width: CGFloat, to url: URL) {
  let box = page.bounds(for: .mediaBox)
  let scale = width / box.width
  let w = Int(box.width * scale), h = Int(box.height * scale)
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4,
    hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.current = ctx
  ctx.cgContext.setFillColor(NSColor.white.cgColor)
  ctx.cgContext.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.cgContext.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx.cgContext)
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.85])!
  try! data.write(to: url)
}

for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i) else { continue }
  let n = String(format: "%02d", i + 1)
  render(page, width: 2048, to: outDir.appendingPathComponent("spread-\(n).jpg"))
  render(page, width: 1024, to: outDir.appendingPathComponent("spread-\(n)-sm.jpg"))
  print("spread-\(n)")
}
print("Done: \(doc.pageCount) spreads in \(outDir.path)")
