import React from 'react/addons';
import moment from 'moment';
import userResource from '../../userResource.js';

//TODO:
//- Refactor this, make it more clear

var date = new Date();

const MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];




export default class MiniCalendar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            // keep the last selected date :)
            date: moment(props.value),
            oooDates: {},
            businessHours: [0,0,0,0,0,0,0],
            meta: {
                loading: false
            }

        }
    }

    componentDidMount() {
        this.setState({
            meta: {
                loading: true
            }
        })
        userResource
            .getRef()
            .child('businessHours')
            .once('value', (snapshot) => {
                let hours = snapshot.val();
                this.setState({
                    meta: {
                        loading: false
                    }
                })
                if (!hours) return;

                this.setState({
                    businessHours: hours
                }, () => {
                    this.onChange.call(this)
                })
            })

         userResource
            .getRef()
            .child('oooDates')
            .once('value', (snapshot) => {
                let oooDates = snapshot.val();
                this.setState({
                    meta: {
                        loading: false
                    }
                })
                if (!oooDates) return;

                this.setState({ oooDates }, () => {
                    this.onChange.call(this)
                })
            })

    }

    previousMonth() {
        this.setState({
            date: this.state.date.subtract(1, 'month')
        })
    }

    nextMonth() {
        this.setState({
            date: this.state.date.add(1, 'month')
        })
    }

    today() {
        this.setState({
            date: moment()
        })
    }

    selectHandler(event) {
        var date = +event.target.innerHTML;
        if (Number.isNaN(date)) {
            return;
        }
        this.setState({
            date: this.state.date.date(date)
        }, this.onChange)
    }

    onChange() {
        var onChangeHandler = this.props.onChange;
        if (!onChangeHandler) {
            return
        }

        // Invoke outside hanlder with native js date
        onChangeHandler(this.state.date.toDate(), this.state.businessHours[this.state.date.day()], this.state.oooDates)
    }

    render() {
        var days = this.state.date.daysInMonth();
        var dateClone = moment(this.state.date)
        var calMatrix = [];
        var calMatrixRow = [];
        var dayOfWeek;
        for (var day = 1; day <= days; day++) {
            dayOfWeek =   dateClone.date(day).day();
            calMatrixRow[dayOfWeek] = day;
            if (dayOfWeek === 6 || day === days) {
                calMatrixRow.length = 7;
                calMatrix.push(calMatrixRow)
                calMatrixRow = [];
            }
        }
        var cal = calMatrix.map((week) => {
                    var ret = [];
                    let businessHours = this.state.businessHours;
                    let oooDates = this.state.oooDates;
                    let cDate = this.state.date;
                    let dFormat ='YYYY-MM-DD';

                    for  (var day = 0; day < week.length; day++) {
                        ret.push(
                            <td
                                key={Math.random()}
                                className={
                                    !week[day] ?
                                    'emptyCal' :
                                    week[day] === this.state.date.date() ?
                                    'active' :
                                    (businessHours[day] && !businessHours[day].enabled) ||
                                    (
                                        oooDates.start <= moment(cDate).date(week[day]).format(dFormat) &&
                                        oooDates.end >= moment(cDate).date(week[day]).format(dFormat)
                                    ) ?
                                    'disabled' :
                                    undefined
                                    }
                                >
                                {week[day]}
                            </td>
                        )
                    }

                    return (
                        <tr key={Math.random()}>
                            {ret}
                        </tr>
                    );
                })

        return (
            <table className="mini-calendar">
                <thead>
                    <tr>
                        <th colSpan="7">
                             {MESES[this.state.date.month()] +  ' ' + this.state.date.year()}

                             <button className="pull-right btn btn-default" onClick={this.nextMonth.bind(this)}><i className="fa fa-chevron-right"></i>
                             </button>
                             <button className="pull-right btn btn-default" onClick={this.previousMonth.bind(this)}><i className="fa fa-chevron-left"></i>
                             </button>
                        </th>
                    </tr>
                    <tr>
                        <th className="text-center">D</th>
                        <th className="text-center">L</th>
                        <th className="text-center">M</th>
                        <th className="text-center">X</th>
                        <th className="text-center">J</th>
                        <th className="text-center">V</th>
                        <th className="text-center">S</th>
                    </tr>
                </thead>

                <tbody className="text-center" onClick={this.selectHandler.bind(this)}>
                    {cal}
                </tbody>

                <tfoot>
                     <tr>
                        <th colSpan="7">
                             <button className="btn btn-default" onClick={this.today.bind(this)}>
                                Hoy
                             </button>
                        </th>
                    </tr>
                </tfoot>
            </table>
        );
    }

}
