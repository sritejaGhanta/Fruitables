import { Inject, Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { format } from 'date-fns';

import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import responseExportConfig from './response.export.config';

interface FinalResponseInterface {
  file_data: any;
  file_name: string;
}

interface ResponseFormattingInterface {
  api_name: string;
  data: any[];
}

type FileType = 'pdf' | 'xlsx' | 'csv';

@Injectable()
export class PdfExportService {
  // @Inject()
  protected readonly general: CitGeneralLibrary;

  constructor() {}

  async exportFile(
    data: any[],
    type: FileType = 'pdf',
    api_name: string = '',
  ): Promise<FinalResponseInterface> {
    let export_data: { api_name: string; data: any } =
      this.exportResponseFormatting(null, data);
    let final_obj: FinalResponseInterface;

    switch (type.toLocaleLowerCase()) {
      case 'pdf':
        final_obj = await this.generatePdf(
          export_data.data,
          export_data.api_name,
        );
        break;
      case 'xlsx':
        final_obj = this.generateXlsx(export_data.data, export_data.api_name);
        break;
      case 'csv':
        final_obj = this.generateCsv(export_data.data, export_data.api_name);
        break;
    }

    return final_obj;
  }

  private exportResponseFormatting(
    apiCode: string,
    apiData: any[],
  ): ResponseFormattingInterface {
    if (!apiCode) return { api_name: '', data: apiData };
    const dateFormat = 'dd MMM, yyyy | hh:mm a';
    const returnData = [];
    const apiConfig = responseExportConfig[apiCode];
    try {
      if (apiConfig) {
        let order_by = apiConfig.order_by || Object.keys(apiConfig.fields);
        apiConfig.fields = { ...apiConfig.fields };
        apiData.forEach((ele) => {
          let newObj = {};
          for (const key of order_by) {
            if (key in apiConfig.fields) {
              const keyConfig = apiConfig.fields[key];
              let formatValue = (ele[key] && ele[key]) || '-';

              if (
                'initial' in keyConfig &&
                (!formatValue || formatValue == '-')
              ) {
                formatValue = keyConfig.initial;
              }

              if ('formatter' in keyConfig && formatValue != '-') {
                switch (keyConfig.formatter) {
                  case 'datetime':
                    formatValue = new Date(formatValue);
                    formatValue = format(formatValue, dateFormat);
                    break;
                }
              }

              newObj[keyConfig.columnTitle] = formatValue;
            }
          }
          returnData.push(newObj);
        });
      }
    } catch (err) {
      console.log(err);
    }
    return { api_name: apiConfig.api_name, data: returnData };
  }

  private async generatePdf(
    data: any[],
    api_name: string,
  ): Promise<FinalResponseInterface> {
    const file_name = api_name + '_' + Date.now() + '.pdf';
    let scale = 0.1;
    const datakeys = Object.keys(data[0]).length;
    if (datakeys >= 1 && datakeys <= 3) {
      scale = 1.5;
    } else if (datakeys <= 5) {
      scale = 1;
    } else if (datakeys <= 8) {
      scale = 0.8;
    } else if (datakeys <= 11) {
      scale = 0.3;
    }

    const ejsdata = ejs.compile(
      fs.readFileSync(process.cwd() + '/src/views/pdf.ejs', 'utf-8'),
    );

    const html = ejsdata({ data, api_name });
    const browser = await puppeteer.launch({ headless: 'new' }); // it is require
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle2' }); //, { waitUntil: 'networkidle2' }
    const pdfBuffer = await page.pdf({
      // path: file_path,
      format: 'A4',
      scale,
      margin: {
        top: '10px',
        left: '10px',
        right: '10px',
        bottom: '0px',
      },
    });

    await page.close();
    await browser.close();
    return { file_data: pdfBuffer, file_name };
  }

  private generateXlsx(data: any[], api_name: string): FinalResponseInterface {
    const file_name: string = api_name + '_' + Date.now() + '.xlsx';
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    const file_data = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    return { file_name, file_data };
  }

  private generateCsv(data: any[], api_name: string): FinalResponseInterface {
    const file_name: string = api_name + '_' + Date.now() + '.csv';
    const sheetData = XLSX.utils.json_to_sheet(data);
    const file_data = XLSX.utils.sheet_to_csv(sheetData);
    return { file_name, file_data };
  }
}
