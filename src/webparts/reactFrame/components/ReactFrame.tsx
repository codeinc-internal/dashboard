import * as React from 'react';
import styles from './ReactFrame.module.scss';
import { IReactFrameProps } from './IReactFrameProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as Chart from 'chart.js';
import ShowTable from './Table/ShowTable';
import { TooltipHost, TooltipDelay, DirectionalHint } from '@fluentui/react/lib/Tooltip';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Icon } from '@fluentui/react/lib/Icon';
initializeIcons();
initializeIcons('https://my.cdn.com/path/to/icons/');
interface listItem {
  Title: string;
  ID: string;
  MilestoneStatus: string;
  ProjectStatus: string;
  StartDate: string;
  ProjectedEndDate: string;

}
interface SPlistItemsState {
  listItems: listItem[],
  isChartDataAvailable: boolean;
  showButton1: boolean;
  ShowButton2: boolean;
  hideGraph: boolean;
  inputValue: string;
  selectedValue: string;
  ProjectStatusSelectedValue: string
}

export default class ReactFrame extends React.Component<IReactFrameProps, SPlistItemsState, {}> {
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private dropdownRef: React.RefObject<HTMLSelectElement>;
  private projectStatusRef: React.RefObject<HTMLSelectElement>;


  constructor(props: IReactFrameProps) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      listItems: [],
      isChartDataAvailable: false,
      showButton1: false,
      ShowButton2: false,
      hideGraph: true,
      inputValue: '',
      selectedValue: "",
      ProjectStatusSelectedValue: ""
    };
    this.dropdownRef = React.createRef();
    this.projectStatusRef = React.createRef();
  }
  async getListItems(context: WebPartContext): Promise<listItem[]> {
    const restApiUrl: string = context.pageContext.web.absoluteUrl + '/_api/web/lists/getByTitle(\'ProjectDetail\')/items';
    try {
      const response: SPHttpClientResponse = await context.spHttpClient.get(restApiUrl, SPHttpClient.configurations.v1, {});
      if (response.ok) {
        const data: any = await response.json();
        return data.value;
      } else {
        throw new Error(`Failed to fetch list items. Status code: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`An error occurred while fetching list items: ${error}`);
    }
  }
  async componentDidMount(): Promise<void> {
    try {
      const items = await this.getListItems(this.props.context);
      this.setState({
        listItems: items,
        isChartDataAvailable: items.length > 0,
      });
    } catch (error) {
      console.log(error);
    }
  }
  public showtoggleButton(event: React.MouseEvent<HTMLButtonElement>): any {
    event.preventDefault()
    this.setState((prev) => ({
      showButton1: !prev.showButton1
    }))
  }
  public showtoggleButton2(event: React.MouseEvent<HTMLButtonElement>): any {
    event.preventDefault()
    this.setState((prev) => ({
      ShowButton2: !prev.ShowButton2
    }))
  }
  public showtoggleGraph(event: React.MouseEvent<HTMLButtonElement>): any {
    event.preventDefault();
    this.setState((prev) => ({
      hideGraph: !prev.hideGraph
    }))
  }
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    console.log("hello")
    this.setState({ inputValue: event.target.value });
  };
  filterItemsByKeyword(keyword: string) {
    keyword = keyword.toLowerCase();
    return this.state.listItems.filter(item => {
      const itemName = item.Title.toLowerCase();
      const projectStatusName = item.ProjectStatus.toLowerCase()
      return (itemName.indexOf(keyword) !== -1 || projectStatusName.indexOf(keyword) !== -1)
    });
  }
  handleChangeSelected = () => {
    // Get the selected value from the dropdown
    const selectedValue = this.dropdownRef.current?.value || "";

    // Update the state with the selected value
    this.setState({ selectedValue: selectedValue });
    console.log(this.state.selectedValue)
  };
  handleChangeSelectedProjectStatus = () => {
    // Get the selected value from the dropdown
    const selectedValue = this.projectStatusRef.current?.value || "";

    // Update the state with the selected value
    this.setState({ ProjectStatusSelectedValue: selectedValue });
    console.log(this.state.ProjectStatusSelectedValue)
  };


  handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    console.log("hello world")
    const data = this.filterItemsByKeyword(this.state.inputValue);
    console.log("data" + data.map((data) => {
      return "Title" + data.Title
    }));
    this.setState({
      listItems: data,
      inputValue: ""
    })


  }
  refeshClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.componentDidMount()

  }

  upcomingProjects: any[] = [];
  completedProject: any[] = [];
  OnGoingProject: any[] = [];
  notStarted = "Not Started";
  onHold = "On Hold"
  Completed = "Completed"
  InProgress = "In Progress"



  currentDate = new Date();
  label: string[] = ["Completed", "In Progress", "Not Started", "Completed", "In progress", "not started", "on Hold"]


  private createChart(labels: string[], data: number[], tooltipData: listItem[]): void {
    const ctx = this.canvasRef.current?.getContext('2d');
    console.log("create chart", this.state.listItems)
    const milestoneStatusCompletedP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.MilestoneStatus === "Completed") {
        const Title: string = data.Title;
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);
    console.log(milestoneStatusCompletedP)
    const milestonesINprogressP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.MilestoneStatus === "In Progress") {
        const Title: string = data.Title;
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);

    const milestoneNotStartedP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.MilestoneStatus === "Not Started") {
        const Title: string = data.Title;
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);
    const ProjectStatusCompletedP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.ProjectStatus === "Completed") {
        const Title: string = data.Title;
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);
    const ProjectStatusIProgressP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.ProjectStatus === "In Progress") {
        const Title: string = data.Title;
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);
    const ProjectStatusNotStartedP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.ProjectStatus === "Not Started") {
        const Title: string = data.Title; // Replace 'someProperty' with the actual property you want to push
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);
    const ProjectStatusOnHoldP = this.state.listItems.reduce((uniqueValues: string[], data) => {
      if (data.ProjectStatus === "On Hold") {
        const Title: string = data.Title; // Replace 'someProperty' with the actual property you want to push
        if (!uniqueValues.includes(Title)) {
          uniqueValues.push(Title);
        }
      }
      return uniqueValues;
    }, []);


    const milestoneStatusCompleted = this.state.listItems.filter((data) => data.MilestoneStatus === "Completed").length;
    const milestonesINprogress = this.state.listItems.filter((data) => data.MilestoneStatus === "In Progress").length;
    const milestoneNotStarted = this.state.listItems.filter((data) => data.MilestoneStatus === "Not Started").length;;
    const ProjectStatusCompleted = this.state.listItems.filter((data) => data.ProjectStatus === "Completed").length;
    const ProjectStatusIProgress = this.state.listItems.filter((data) => data.ProjectStatus === "In Progress").length;;
    const ProjectStatusNotStarted = this.state.listItems.filter((data) => data.ProjectStatus === "Not Started").length;;
    const ProjectStatusOnHold = this.state.listItems.filter((data) => data.ProjectStatus === "On Hold").length;
    const datanumber: number[] = [milestoneStatusCompleted, milestonesINprogress, milestoneNotStarted, ProjectStatusCompleted, ProjectStatusIProgress, ProjectStatusNotStarted, ProjectStatusOnHold]
    const dataData: any[] = [milestoneStatusCompletedP, milestonesINprogressP, milestoneNotStartedP, ProjectStatusCompletedP, ProjectStatusIProgressP, ProjectStatusNotStartedP, ProjectStatusOnHoldP]
    console.log("dataData", dataData[1].ID)
    console.log("hello", datanumber)
    if (ctx) {
      Chart.plugins.register({
        id: "doughnutLabel",
        afterDatasetDraw: (chartInstance: any, easing: any, options: any) => {
          const width = chartInstance.width;
          const height = chartInstance.height;

          const center = { x: width / 2, y: height / 2 };
          const datasets = chartInstance.data.datasets;

          if (!datasets) return;

          datasets.forEach((dataset: any) => {
            const meta = chartInstance.getDatasetMeta(0);

            if (!meta) return;

            const data = meta.data;
            const chartRadius = meta.data[0]._model.outerRadius;

            data.forEach((element: any, index: number) => {

              if (!element.hidden && datanumber[index] > 0) {
                const model = element._model;
                const midAngle = (model.startAngle + model.endAngle) / 2;
                const x = center.x + chartRadius * 1.1 * Math.cos(midAngle);
                const y = center.y + chartRadius * 1.1 * Math.sin(midAngle);
                const extra = x >= center.x ? 15 : -15
                const label = labels[index] + ': ' + dataData[index]
                ctx.strokeStyle = dataset.borderColor[index];
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(center.x + chartRadius * Math.cos(midAngle), center.y + chartRadius * Math.sin(midAngle));
                ctx.lineTo(x, y);
                ctx.lineTo(x + extra, y)
                ctx.stroke();
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = x >= center.x ? 'left' : 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, x >= center.x ? x + 10 : x - 10, y);
              }
            });
          });
        },


      })



      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'project status',
            data: data,
            backgroundColor: [
              'rgba(0, 128, 0, 255) ',
              'rgba(255, 218, 18)',
              'rgba(255, 0, 0, 255)',
              'rgba(0, 0, 255, 255)',
              'rgba(0, 0, 128, 255)',
              '#000000',
              'rgba(135, 206, 235, 1)'
            ],

            borderColor: [
              'rgba(0, 128, 0, 255) ',
              'rgba(255, 218, 18)',
              'rgba(255, 0, 0, 255)',
              'rgba(0, 0, 255, 255)',
              'rgba(0, 0, 128, 255)',
              '#000000',
              'rgba(135, 206, 235, 1)'
            ],
            borderWidth: 0.3,
          }]
        },
        options: {

          spanGaps: true,
          showLines: true,
          cutoutPercentage: 85,

          legend: {
            display: false,
            position: "bottom",
            labels: {
              padding: 20,
            }
          },
          plugins: {
            DougnutLabel: true
          }


        },
      });
    }
  }

  public render(): React.ReactElement<IReactFrameProps> {
    const notStarted = "Not Started";
    const onHold = "On Hold"
    const Completed = "Completed"
    const InProgress = "In Progress"
    { console.log("listItem", this.state.listItems) }
    // get all the data . 

    const notStartedItems = this.state.listItems.filter((data) => data.MilestoneStatus === notStarted);
    const CompletedItems = this.state.listItems.filter((data) => data.MilestoneStatus === Completed);
    const InProgressItems = this.state.listItems.filter((data) => data.MilestoneStatus === InProgress);
    const notStartedItemsP = this.state.listItems.filter((data) => data.ProjectStatus === notStarted);
    const onHoldItemsP = this.state.listItems.filter((data) => data.ProjectStatus === onHold);
    const CompletedItemsP = this.state.listItems.filter((data) => data.ProjectStatus === Completed);
    const InProgressItemsP = this.state.listItems.filter((data) => data.ProjectStatus === InProgress);
    function filterCompletedBetweenYears(items: listItem[], startYear: any, endYear: any) {
      return items.filter(item => {
        const statusIsCompleted = item.ProjectStatus === 'On Hold';
        const itemStartYear = new Date(item.StartDate).getFullYear();
        const itemEndYear = new Date(item.ProjectedEndDate).getFullYear();
        return statusIsCompleted && itemStartYear >= startYear && itemEndYear <= endYear;
      });
    }


    const startYear = 2022;
    const endYear = 2023;
    const completedItemsBetweenYears2022_2023 = filterCompletedBetweenYears(this.state.listItems, startYear, endYear);
    const completedItemsBetweenYears2020_2021 = filterCompletedBetweenYears(this.state.listItems, 2020, 2021);

    this.createChart(
      ["Completed", "In Progress", "Not Started", Completed, InProgress, notStarted, onHold],
      [CompletedItems.length, InProgressItems.length, notStartedItems.length, CompletedItemsP.length, InProgressItemsP.length, notStartedItemsP.length, onHoldItemsP.length], this.state.listItems)

    // const tooltipContent = this.state.listItems.map((item, index) => (
    //   <React.Fragment key={index}>
    //     {item.Title} <br />
    //     {item.ProjectStatus} {index < this.state.listItems.length - 1 && <br />}
    //   </React.Fragment>
    // ));
    return (
      <div >
        <div style={{ alignItems: "center", width: "100%" }}>
          <h1 style={{ fontWeight: "bold", paddingLeft: "35%" }}>Project Detail Record</h1>
        </div>
        <table width="100%" >
          <tr>
            <td>
              <div id="panel">
                <fieldset>
                  <legend style={{ fontWeight: "bold", fontSize: "16px" }}>Search Criteria</legend>

                  <h3>Keyword:</h3>
                  <input type='text' value={this.state.inputValue} placeholder='Search by Project Name' className={styles['custom-input']} onChange={this.handleChange} />

                  <Icon style={{ width: "50px", cursor: "pointer", paddingLeft: "5px", fontWeight: "bold" }} iconName="Refresh" onClick={this.refeshClick} />

                  <br></br>

                  <br />
                  <button className={styles.search} name='Search' value="Search" onClick={(e) => this.handleClick(e)}>Search</button>

                </fieldset>
                <br></br>


                <br></br>
                <div>
                  <div className={styles.tableheader}>
                    <div style={{ width: "300px", textAlign: "center", height: "80%", padding: "3.5px" }}>
                      <p>MileStone Status</p>
                    </div>
                    <div style={{ width: "400px", textAlign: "center", height: "80%", padding: "3.5px" }}>
                      <p>Project  Status</p>
                    </div>
                  </div>
                  <table width="100%" className={styles.altrowstable1} >
                    <tr>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>Completed</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>In Progress</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>Not started</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>{Completed}</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>{InProgress}</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>{notStarted}</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>{onHold}</th>
                      <th style={{ width: "11.1%", fontStyle: "normal" }}>Total</th>
                    </tr>

                    <tr>
                      {/* `Completed  Length: ${CompletedItems.map((data) => {
                            return `Title:${data.Title} <br> ProjectStatus: ${data.ProjectStatus}`;
                          })}` */}
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder} >
                        <TooltipHost
                          content={<span>{CompletedItems.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title} {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_upcoming`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}
                        >

                          <span style={{
                            backgroundColor: "green", padding: "0px 27px", fontSize: "18px", color: "white",
                          }}>{CompletedItems.length}</span>

                        </TooltipHost>
                      </td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{InProgressItems.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title} {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_upcoming_`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}

                        >
                          <span
                            style={{
                              backgroundColor: 'rgba(255, 218, 18)',
                              padding: '0px 27px',
                              fontSize: '18px',
                              color: 'white',
                              display: 'inline-block',
                              cursor: 'pointer', // To show pointer cursor on hover
                            }}
                          >
                            {InProgressItems.length}
                          </span>
                        </TooltipHost>
                      </td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{notStartedItems.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title}  {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_upcoming_`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}
                        //rgba(255, 0, 0, 255)
                        >
                          <span style={{
                            backgroundColor: "rgba(255, 0, 0, 255)", padding: "0px 27px", fontSize: "18px", color: "white",
                          }}>{notStartedItems.length}</span>
                        </TooltipHost>
                      </td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{CompletedItemsP.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title}  {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_completed_project_status}`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}
                        //rgba(0, 0, 255, 255)
                        >
                          <span style={{
                            backgroundColor: "rgba(255, 0, 0, 255)", padding: "0px 27px", fontSize: "18px", color: "white",
                          }}   >{CompletedItemsP.length}</span>
                        </TooltipHost>
                      </td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{InProgressItemsP.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title}  {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_InProgress_project_status`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}
                        //rgba(0, 0, 128, 255)
                        >
                          <span style={{
                            backgroundColor: "rgba(0, 0, 128, 255)", padding: "0px 27px", fontSize: "18px", color: "white",
                          }}   >{InProgressItemsP.length}</span>
                        </TooltipHost>
                      </td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{notStartedItemsP.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title} {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_Not_Started_project_status_${notStartedItemsP.length}`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}
                        //#000000
                        >
                          <span style={{
                            backgroundColor: "#000000", padding: "0px 27px", fontSize: "18px", color: "white",
                          }}  >{notStartedItemsP.length}</span>
                        </TooltipHost>
                      </td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{onHoldItemsP.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title}  {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_Not_Started_project_status_${onHoldItemsP.length}`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}
                        //rgba(245, 245, 220)
                        >
                          <span style={{
                            backgroundColor: "rgba(135, 206, 235, 1)", padding: "0px 27px", fontSize: "18px", color: "white",
                          }}   >{onHoldItemsP.length}</span>
                        </TooltipHost></td>
                      <td width="12.5%" style={{ textAlign: "center", paddingTop: "5px" }} className={styles.tabledataborder}>
                        <TooltipHost
                          content={<span>{this.state.listItems.map((item, index) => (
                            <React.Fragment key={index}>
                              {item.Title}
                              {index < this.state.listItems.length - 1 && <br />}
                            </React.Fragment>
                          ))}</span>}
                          id={`tooltip_Not_Started_project_status_${this.state.listItems.length}`}
                          calloutProps={{ gapSpace: 0 }}
                          delay={TooltipDelay.zero}
                          directionalHint={DirectionalHint.bottomCenter}

                        ><span style={{ fontSize: "18px", color: "black", fontWeight: "bold", paddingLeft: "20px", paddingRight: "22px", marginLeft: "3px" }}  >{this.state.listItems.length}</span>
                        </TooltipHost>
                      </td>

                    </tr>
                  </table>
                </div>
              </div>
              <br />

              <h3 className={styles.headingStyle}>Project detail stats</h3>
              <div id="stat"></div> <br /><br />
              <div className={styles['button-container']}>
                <button className={styles.button} type="button" id="showmenu" onClick={(e) => this.showtoggleGraph(e)}>
                  Graph</button>
              </div>
              <br></br>
              <br></br>
              <div style={{ display: this.state.hideGraph ? "block" : "none" }}>
                <canvas ref={this.canvasRef}></canvas>
              </div>
              <br></br>
              <div className={styles['button-container']}>
                <button type="button" className={styles.button} id="showmenu" onClick={(e) => this.showtoggleButton(e)}>
                  Show Fiscal Year 2020/2021 - Completed Projects
                </button>
              </div>
              <br></br>
              <br></br>
              <div style={{ display: this.state.showButton1 ? "block" : "none" }}>

                <ShowTable item={completedItemsBetweenYears2020_2021} isItemsAvailable={this.state.isChartDataAvailable}></ShowTable>
              </div>

              <br></br>
              <br></br>
              <div className={styles['button-container']}>
                <button type="button" className={styles.button} id="showmenu" onClick={(e) => this.showtoggleButton2(e)}>
                  Show Fiscal Year 2022/2023 - Completed Projects
                </button>
              </div>
              <br></br>
              <br></br>
              <div style={{ display: this.state.ShowButton2 ? "block" : "none" }}>
                <ShowTable item={completedItemsBetweenYears2022_2023} isItemsAvailable={this.state.isChartDataAvailable}></ShowTable>
              </div>



            </td>

          </tr>
        </table><br />

      </div>
    );
  }
}
