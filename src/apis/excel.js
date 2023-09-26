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
    async readExcelFile(file, headers) {
        let reader = new FileReader()
        let tmpResult = {}

        const cols = this.getColumnList(headers.length)
        let promise = new Promise((resolve, reject) => {
            reader.onload = (e) => {
                let data = reader.result
                let workbook = excel.read(data, {type: 'binary'})
                try {
                    workbook.SheetNames.forEach(sheetName => {
                        for (let i = 0; i < headers.length; i++) {
                            workbook.Sheets[sheetName][cols[i]+1].w = headers[i]
                        }
                        const roa = excel.utils.sheet_to_json(workbook.Sheets[sheetName])
                        tmpResult = roa
                    })
                } catch (e) {
                    alert("엑셀 업로드 오류! 샘플 엑셀 파일을 참고하세요.")
                }
                resolve(tmpResult)
            }
            reader.readAsBinaryString(file)
        })

        return promise

    }
}