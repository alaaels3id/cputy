import Cocoa

func createTrayIcon(size: CGFloat, scale: CGFloat, outputPath: String) {
    let pixelSize = size * scale
    let image = NSImage(size: NSSize(width: pixelSize, height: pixelSize))
    
    image.lockFocus()
    
    // Clear transparent background
    NSColor.clear.set()
    NSRect(x: 0, y: 0, width: pixelSize, height: pixelSize).fill()
    
    let ctx = NSGraphicsContext.current!.cgContext
    ctx.scaleBy(x: scale, y: scale)
    
    // Draw macOS Template Icon (monochrome black)
    let color = NSColor.black
    color.setStroke()
    color.setFill()
    
    // Center alignment with optimal macOS status bar padding
    let center = CGPoint(x: size / 2.0, y: size / 2.0)
    let radius: CGFloat = size * 0.31 // ~5.0 pt radius
    let lineWidth: CGFloat = 1.35
    
    let path = NSBezierPath()
    path.lineWidth = lineWidth
    path.lineCapStyle = .round
    path.lineJoinStyle = .round
    
    // Open circle from 45 deg to 315 deg (sleek C shape gauge)
    path.appendArc(withCenter: center, radius: radius, startAngle: 40, endAngle: 320, clockwise: false)
    path.stroke()
    
    // Inner center dot
    let dotRadius: CGFloat = 1.15
    let dotPath = NSBezierPath(ovalIn: NSRect(x: center.x - dotRadius, y: center.y - dotRadius, width: dotRadius * 2, height: dotRadius * 2))
    dotPath.fill()
    
    // Top-right dynamic spark accent
    let sparkPath = NSBezierPath()
    sparkPath.lineWidth = 1.25
    sparkPath.lineCapStyle = .round
    sparkPath.move(to: CGPoint(x: center.x + radius * 0.82, y: center.y + radius * 0.82))
    sparkPath.line(to: CGPoint(x: center.x + radius * 1.32, y: center.y + radius * 1.32))
    sparkPath.stroke()
    
    image.unlockFocus()
    
    guard let tiffData = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiffData),
          let pngData = bitmap.representation(using: .png, properties: [:]) else {
        print("Failed to encode PNG for \(outputPath)")
        return
    }
    
    try? pngData.write(to: URL(fileURLWithPath: outputPath))
    print("Generated: \(outputPath)")
}

let fileManager = FileManager.default
let currentDir = fileManager.currentDirectoryPath
let buildDir = "\(currentDir)/build"
try? fileManager.createDirectory(atPath: buildDir, withIntermediateDirectories: true)

createTrayIcon(size: 16, scale: 1.0, outputPath: "\(buildDir)/trayTemplate.png")
createTrayIcon(size: 16, scale: 2.0, outputPath: "\(buildDir)/trayTemplate@2x.png")
createTrayIcon(size: 16, scale: 3.0, outputPath: "\(buildDir)/trayTemplate@3x.png")
