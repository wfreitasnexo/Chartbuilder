var React = require("react");
var PropTypes = React.PropTypes;
var update = React.addons.update;

// Flux actions
var ChartViewActions = require("../../actions/ChartViewActions");
var ChartServerActions = require("../../actions/ChartServerActions");

var validateChartModel = require("../../util/validate-chart-model");

var chartbuilderUI = require("chartbuilder-ui");
var TextArea = chartbuilderUI.TextArea;
var Alert = chartbuilderUI.Alert;

var inputAlerts = {
	"EMPTY": {
		alertText: "Digite alguns dados acima.",
		boldText: "Hello!",
		alertType: "default"
	},
	"UNEVEN_SERIES": {
		alertText: "Pelo menos uma das suas linhas não têm o mesmo número de colunas como o restante .",
		boldText: "Error:",
		alertType: "error"
	},
	"column_zero": {
		alertText: "Você tem um gráfico de colunas que não tem um eixo zero. Verifique que este é ok.",
		boldText: "Warning:",
		alertType: "warning"
	},
	"TOO_MANY_SERIES": {
		alertText: "Você tem mais de 12 colunas , que é mais do que apoios Chartbuilder",
		boldText: "Error:",
		alertType: "error"
	},
	"TOO_FEW_SERIES": {
		alertText: "Você tem menos de 2 linhas , o que é menos do que Chartbuilder suporta .",
		boldText: "Error:",
		alertType: "error"
	},
	"NAN_VALUES": {
		alertText: "Pelo menos um dos seus pontos de dados não pode ser convertido a uma série",
		boldText: "Error:",
		alertType: "error"
	},
	"NOT_DATES": {
		alertText: "A menos, uma das suas datas não podem ser compreendidas por Chartbuilder",
		boldText: "Error:",
		alertType: "error"
	},
	"VALID": {
		alertText: "Seus dados parecem satisfatórios",
		boldText: "",
		alertType: "success"
	}
};

/**
 * ### Text area component and error messaging for data input
 * @instance
 * @memberof editors
 */
var DataInput = React.createClass({

	propTypes: {
		chartProps: PropTypes.shape({
			input: PropTypes.shape({
				raw: PropTypes.string,
				status: PropTypes.string,
				valid: PropTypes.bool
			}).isRequired,
			chartSettings: PropTypes.array,
			data: PropTypes.array,
			scale: PropTypes.object
		}).isRequired,
		className: PropTypes.string
	},

	getInitialState: function() {
		return {
			alertType: "default",
			alertText: "Waiting for data...",
			boldText: "",
			dropping: false
		};
	},

	_handleReparseUpdate: function(k, v) {
		// reset the raw input value
		var input = update(this.props.chartProps.input, { $merge: { raw: v }});
		ChartViewActions.updateInput(k, input);
	},

	componentDidMount: function() {
		this.setState(inputAlerts[this.props.chartProps.input.status]);
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState(inputAlerts[nextProps.chartProps.input.status]);
	},

	_toggleDropState: function(e) {
		this.setState({ dropping: !this.state.dropping });
	},

	onFileUpload: function(e) {
		var reader = new FileReader();
		reader.onload = function() {
			parsedModel = validateChartModel(this.result);
			if (parsedModel) {
				// Update flux store with incoming model
				ChartServerActions.receiveModel(parsedModel);
			}
		};
		this._toggleDropState();
		reader.readAsText(e.target.files[0]);
	},

	// Render only the dropover area
	_renderDropArea: function() {
		return (
			<div
				className={this.props.className + " dropping"}
				onDragLeave={this._toggleDropState}
			>
				<div className="file-drop">
					<p>Drop configuration file here</p>
				</div>
				<input type="file" id="input" onChange={this.onFileUpload}/>
			</div>
		);
	},

	// Render the data input text area and indicator
	_renderDataInput: function() {
		return (
			<div className={this.props.className}
				onDragOver={this._toggleDropState}
			>
				<label>se você tem um arquivo json, o arraste para cá</label>
				<TextArea
					value={this.props.chartProps.input.raw}
					onChange={this._handleReparseUpdate.bind(null, "input")}
					className="data-input"
					defaultValue={this.props.chartProps.input.raw}
				/>
				<Alert
					alertType={this.state.alertType}
					alertText={this.state.alertText}
					boldText={this.state.boldText}
				/>
			</div>
		);
	},

	render: function() {
		if (this.state.dropping) {
			return this._renderDropArea();
		} else {
			return this._renderDataInput();
		}
	}

});

module.exports = DataInput;
