import Foundation
import PDFKit
guard let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1])) else { exit(2) }
var chars = 0, links = 0, missingFooter = 0
for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let text = page.string ?? ""
    chars += text.count
    if !text.contains("Ledgify Complete User Manual") || !text.contains("\(i + 1) of \(doc.pageCount)") { missingFooter += 1 }
    links += page.annotations.filter { $0.action is PDFActionURL || $0.action is PDFActionGoTo }.count
}
print("pages=\(doc.pageCount) selectableCharacters=\(chars) links=\(links) pagesMissingNumberFooter=\(missingFooter)")
