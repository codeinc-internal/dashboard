import * as React from 'react';

interface listItem {
    Title: string;
    ID: string;
    MilestoneStatus: string;
    ProjectStatus: string;
    StartDate: string;
    ProjectedEndDate: string;

}
interface Props {
    item: listItem[],
    isItemsAvailable: boolean
}


export default class ShowTable extends React.Component<Props, any> {
    constructor(props: any) {
        super(props);

    }
    public getTheDateFormate(date: any): any {

        const dateObject = new Date(date);

        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().length === 1 ? `0${dateObject.getMonth() + 1}` : (dateObject.getMonth() + 1);
        const day = dateObject.getDate().toString().length === 1 ? `0${dateObject.getDate()}` : dateObject.getDate();

        const formattedDate = `${year}-${month}-${day}`;
        console.log("formate", formattedDate)
        return formattedDate;
    }

    render() {
        const { item } = this.props
        return (
            <div>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ccc', backgroundColor: '#004e8a', color: "white" }}>
                            <th style={{ padding: '8px', fontWeight: 'bold' }}>Project Name</th>
                            <th style={{ padding: '8px', fontWeight: 'bold' }}>ID</th>
                            <th style={{ padding: '8px', fontWeight: 'bold' }}>Milestone Status</th>
                            <th style={{ padding: '8px', fontWeight: 'bold' }}>Project Status</th>
                            <th style={{ padding: '8px', fontWeight: 'bold' }}>Start Date</th>
                            <th style={{ padding: '8px', fontWeight: 'bold' }}>End Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item.map((data) => (
                            <tr key={data.ID} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{data.Title}</td>
                                <td style={{ padding: '8px' }}>{data.ID}</td>
                                <td style={{ padding: '8px' }}>{data.MilestoneStatus}</td>
                                <td style={{ padding: '8px' }}>{data.ProjectStatus}</td>
                                <td style={{ padding: '8px', }}>{this.getTheDateFormate(data.StartDate)}</td>
                                <td style={{ padding: '8px' }}>{this.getTheDateFormate(data.ProjectedEndDate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        );
    }
}