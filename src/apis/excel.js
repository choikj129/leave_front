const excel = require("xlsx");

export default {
    excelDownload(data, file, sheet="sheet1") {
        if (!file.endsWith(".xlsx")) file += ".xlsx"
        const year = data[0].연도
        const ws = excel.utils.json_to_sheet(data)
        const wb = excel.utils.book_new()

        excel.utils.book_append_sheet(wb, ws, sheet)
        excel.writeFile(wb, file)
    }
}