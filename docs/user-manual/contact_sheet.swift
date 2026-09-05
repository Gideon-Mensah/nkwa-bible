import AppKit

let fm = FileManager.default
let source = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let output = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
try? fm.createDirectory(at: output, withIntermediateDirectories: true)
let files = (try fm.contentsOfDirectory(at: source, includingPropertiesForKeys: nil)).filter { $0.pathExtension == "png" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
let columns = 3, rows = 4, perSheet = columns * rows
let thumb = NSSize(width: 298, height: 421), gap: CGFloat = 24, label: CGFloat = 26
for start in stride(from: 0, to: files.count, by: perSheet) {
    let sheet = NSImage(size: NSSize(width: CGFloat(columns) * (thumb.width + gap) + gap, height: CGFloat(rows) * (thumb.height + label + gap) + gap))
    sheet.lockFocus(); NSColor(calibratedWhite: 0.82, alpha: 1).setFill(); NSRect(origin: .zero, size: sheet.size).fill()
    for offset in 0..<min(perSheet, files.count - start) {
        guard let image = NSImage(contentsOf: files[start + offset]) else { continue }
        let col = offset % columns, row = offset / columns
        let x = gap + CGFloat(col) * (thumb.width + gap)
        let y = sheet.size.height - gap - CGFloat(row + 1) * (thumb.height + label + gap) + label + gap
        image.draw(in: NSRect(x: x, y: y, width: thumb.width, height: thumb.height))
        let text = "Page \(start + offset + 1)" as NSString
        text.draw(at: NSPoint(x: x, y: y - label), withAttributes: [.font:NSFont.boldSystemFont(ofSize: 15), .foregroundColor:NSColor.black])
    }
    sheet.unlockFocus()
    if let tiff=sheet.tiffRepresentation, let bitmap=NSBitmapImageRep(data:tiff), let png=bitmap.representation(using:.png,properties:[:]) { try png.write(to: output.appendingPathComponent(String(format:"sheet-%02d.png",start/perSheet+1))) }
}
