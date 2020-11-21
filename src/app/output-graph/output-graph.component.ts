import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

@Component({
  selector: 'app-output-graph',
  templateUrl: './output-graph.component.html',
  styleUrls: ['./output-graph.component.css'],
})
export class OutputGraphComponent implements OnInit {
  public options: any = {
    rangeSelector: {
      selected: 2,
    },
    title: {
      text: 'Stock Price Graph',
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      x: 10,
      y: 10,
    },
    series: [],
  };

  public newURL: any = '';
  public urls: any = [];
  public isHidden: any = false;

  public builds: any = [
    { id: '1', name: 'CLOSE' },
    { id: '2', name: 'MID' },
  ];

  public yAxisSelect: any;

  constructor(private http: HttpClient) {
    this.yAxisSelect = 1;
  }
  ngOnInit() {
    Highcharts.stockChart('container', this.options);
  }

  getApiResponse(url) {
    return this.http
      .get<any>(url, {})
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  addURL(newUrl: string) {
    if (newUrl) {
      this.urls.push(newUrl);
      this.newURL = '';
    }
  }

  buildGraph() {
    if (this.urls != null && this.urls.length > 0) {
      this.isHidden = true;
      this.options.series = [];
      const requestArray = [];
      const yAxisSelect = this.yAxisSelect;
      this.urls.forEach((url) => {
        requestArray.push(this.http.get(url));
      });
      forkJoin(requestArray).subscribe(
        (results) => {
          console.log(results);
          results.forEach((data) => {
            let seriesData = [];
            let dataset = data['dataset']['data'];

            dataset.forEach(function (row) {
              if (yAxisSelect == 1) {
                let temp_row = [
                  Number(new Date(row[0]).getTime()),
                  Number(row[4]),
                ];
                seriesData.push(temp_row);
              }
              if (yAxisSelect == 2) {
                let temp_row = [
                  Number(new Date(row[0]).getTime()),
                  Number(row[2]) + Number(row[3]) / 2,
                ];
                seriesData.push(temp_row);
              }
            });
            seriesData.reverse();

            let series = {
              type: 'line',
              name: data['dataset']['dataset_code'],
              data: seriesData,
              lineWidth: 0,
              marker: {
                enabled: true,
                radius: 2.5,
              },
              tooltip: {
                valueDecimals: 2,
              },
              states: {
                hover: {
                  lineWidthPlus: 0,
                },
              },
            };
            this.options.series.push(series);
          });

          if (
            this.options != null &&
            this.options.series != null &&
            this.options.series.length > 0
          ) {
            Highcharts.stockChart('container', this.options);
          }
          this.isHidden = false;
        },
        (error) => {
          this.isHidden = false;
        }
      );
    }
  }

  clearGraph() {
    if (this.options != null) {
      this.options.series = [];
      Highcharts.stockChart('container', this.options);
    }
  }
  clearData() {
    this.clearGraph();
    this.urls = [];
    this.yAxisSelect = 1;
  }
}
