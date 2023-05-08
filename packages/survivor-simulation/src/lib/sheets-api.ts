type SheetInfo = {
  sheetName?: string;
  sheetId?: number;
};

export class SheetsAPI {
  private id: string
  private sheetName?: string
  private sheetId?: number

  constructor(spreadsheetId: string, sheetInfo?: SheetInfo | string) {
    this.id = spreadsheetId
    this.parseSheetInfo(sheetInfo)
  }

  public async load<T = unknown>(spreadsheetId?: string, sheetInfo?: SheetInfo | string): Promise<Array<T>> {
    if (spreadsheetId) this.id = spreadsheetId
    if (sheetInfo) this.parseSheetInfo(sheetInfo)

    if (!this.id) throw new Error('SpreadsheetId is required.')

    const spreadsheetResponse = await this.getSpreadsheetDataUsingFetch()

    if (spreadsheetResponse === null) return []

    return this.getItems(spreadsheetResponse)
  }

  private parseSheetInfo(sheetInfo?: SheetInfo | string): void {
    if (sheetInfo) {
      if (typeof sheetInfo === 'string') {
        this.sheetName = sheetInfo
        this.sheetId = undefined
      } else if (typeof sheetInfo === 'object') {
        this.sheetName = sheetInfo.sheetName
        this.sheetId = sheetInfo.sheetId
      }
    }
  }

  private async getSpreadsheetDataUsingFetch(): Promise<string | null> {
    if (!this.id) return null
    let url = `https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`
    if (this.sheetId) {
      url = url.concat(`gid=${this.sheetId}`)
    } else if (this.sheetName) {
      url = url.concat(`sheet=${this.sheetName}`)
    }

    return fetch(url)
      .then((r) => (r && r.ok && r.text ? r.text() : null))
      .catch(/* istanbul ignore next */ (_) => null)
  }

  private normalizeRow(rows: any[]): any[] {
    return rows.map((row) => (row && row.v !== null && row.v !== undefined ? row : {}))
  }

  private applyHeaderIntoRows(header: string[], rows: any[]): any[] {
    return rows
      .map(({c: row}) => this.normalizeRow(row))
      .map((row) => row.reduce((p, c, i) => (c.v ? {...p, [header[i]]: c.v} : p), {}))
  }

  private getItems(spreadsheetResponse: string): any[] {
    let rows = []

    try {
      const parsedJSON = JSON.parse(spreadsheetResponse.split('\n')[1].replace(/google.visualization.Query.setResponse\(|\);/g, ''))
      const hasSomeLabelPropertyInCols = parsedJSON.table.cols.some(({label}: { label: string }) => !!label)
      if (hasSomeLabelPropertyInCols) {
        const header = parsedJSON.table.cols.map(({label}: { label: string }) => label)

        rows = this.applyHeaderIntoRows(header, parsedJSON.table.rows)
      } else {
        const [ headerRow, ...originalRows ] = parsedJSON.table.rows
        const header = this.normalizeRow(headerRow.c).map((row) => row.v)

        rows = this.applyHeaderIntoRows(header, originalRows)
      }
    } catch (e) {
    }

    return rows
  }
}
