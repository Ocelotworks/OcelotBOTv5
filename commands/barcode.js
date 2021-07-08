module.exports = {
    name: "Barcode Generator",
    usage: "barcode :code+",
    rateLimit: 10,
    detailedHelp: "Generates a barcode. C128B, to be precise.",
    usageExample: "barcode hello",
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["barcode"],
    run:  function(context){
        return context.send(`https://www.barcodesinc.com/generator/image.php?code=${encodeURIComponent(context.options.code)}&style=197&type=C128B&width=${167+(context.options.code.length*5)}&height=50&xres=1&font=3`)
    }

};