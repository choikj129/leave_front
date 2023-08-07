const excel = require("xlsx-color")



export default {
    excelDownload(data, file, sheet="sheet1", options) {
        if (!file.endsWith(".xlsx")) file += ".xlsx"
        const ws = excel.utils.json_to_sheet(data)
        const wb = excel.utils.book_new()

        excel.utils.book_append_sheet(wb, ws, sheet)
        
        const cols = this.getColumnList(Object.keys(data[0]).length)
        cols.forEach(col => {
            /* 배경색, 테두리 등 설정 */
            wb.Sheets[sheet][col+1].s = {
                fill : {
                    patternType : "solid",
                    fgColor: { rgb: "FFFCFCC2" },
                },
                border : {
                    bottom : { style : "thin", color : { rgb: "FF000000" } }
                },
            }
        })

        /* 기타 옵션 */
        Object.entries(options).forEach(option => {
            try {
                wb.Sheets[sheet][option[0]] = option[1]
            } catch (e) {
                console.error("Not Supported Key", option[0])
            }
        })

        excel.writeFile(wb, file)
    },
    /* 엑셀 column 이름 */
    getColumnList(count) {
        const base = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
        let result = []
        for (let i=0; i<count; i++) {
            let col = base[i % 26]
            let cnt = i
            while (Math.floor(cnt / 26) > 0) {
                cnt = Math.floor(cnt / 26) -1
                col = base[cnt % 26] + col
            }
            result.push(col)
        }
        return result
    },
    readExcelFile(event) {
        const file = event.target.files[0]
        let reader = new FileReader()
        let tmpResult = {}

        let promise = new Promise((resolve, reject) => {
            reader.onload = (e) => {
                let data = reader.result
                let workbook = excel.read(data, {type: 'binary'})
                workbook.SheetNames.forEach(sheetName => {
                    workbook.Sheets[sheetName].A1.w = "아이디"
                    workbook.Sheets[sheetName].B1.w = "이름"
                    workbook.Sheets[sheetName].C1.w = "직위"
                    workbook.Sheets[sheetName].D1.w = "연도"
                    workbook.Sheets[sheetName].E1.w = "휴가수"
                    workbook.Sheets[sheetName].F1.w = "입사일"
                    workbook.Sheets[sheetName].G1.w = "이메일"
                    workbook.Sheets[sheetName].H1.w = "생일"
                    workbook.Sheets[sheetName].I1.w = "음력여부"
                    const roa = excel.utils.sheet_to_json(workbook.Sheets[sheetName])
                    tmpResult = roa
                })
                resolve(tmpResult)
            }
            reader.readAsBinaryString(file)
        })

        return promise

    }
}