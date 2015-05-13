import React from 'react/addons';
import ReactMixin from 'react-mixin';
import {Typeahead} from 'react-typeahead';
import Firebase from 'firebase';

import sessionStore from '../../stores/sessionStore.js';
import argutils from '../../argutils.js';
import osutils from '../../osutils.js';

//TODO: move elsewhere
const typeaheadClasses = {
                input: 'form-control',
                results: 'list-group',
                listAnchor: 'list-group-item'
            };

var patientsRef = new Firebase('https://luminous-fire-4753.firebaseio.com/patients');



// TODO:
// - Add a loading state and ui
export default class PatientForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            OSoptions: osutils.getNames(),
            locOptions: [],
            patientName: '',
            patientEmail: '',
            patientDNI: '',
            patientDOB: '',
            patientPostalCode: '',
            patientAddress: '',
            patientOSname: '',
            patientOSaffiliateNumber: '',
            patientOSplan: '',
            patientTel: '',
            patientMedicalHistory: ''
        }
    }

    onProvinceSelected(province) {
        this.setState({
            locOptions: argutils.locByProvince(province)
        });
    }

    onLocalitySelected(locality) {
        this.setState({
            patientPostalCode: argutils.postalByLoc(locality)
        });
    }


    onOSselected(os) {
        this.setState({
            patientOSname: os
        });
    }

    submit(event) {
        event.preventDefault();

        // Check that Postal Code is not null and if it is found in the places collection
        if (!argutils.isValidPostalCode(this.state.patientPostalCode)) {
            alert('Por favor busque y seleccione provincia y localidad');
            return;
        }
        // Check if OS is not null and if it is found in the places collectio
        if (!osutils.isValidName(this.state.patientOSname)) {
            alert('Por favor: buscar y selecciona una obra social');
            return;
        }

        var osId = osutils.getIdByName(this.state.patientOSname);
        var ownerEmail = sessionStore.getUsername();
        if (!ownerEmail) {
            // This should not happen ever
            alert('Algo salio mal, por favor reinicia sesion');
            return;
        }

        var newPatient = {
            name: this.state.patientName,
            DNI: this.state.patientDNI,
            tel: this.state.patientTel,
            // TODO: work on the format of this DOB
            DOB: this.state.patientDOB,
            email: this.state.patientEmail,
            address: this.state.patientAddress,
            postalCode: this.state.patientPostalCode,
            medicalHistory: this.state.patientMedicalHistory,
            ownerEmail: sessionStore.getUsername(),
            osId: osId,
            osPlan: this.state.patientOSplan,
            osAffiliateNumber: this.state.patientOSaffiliateNumber
        };

        patientsRef
            .push(newPatient, function() {
                //on complete
                alert('El Paciente ha sido creado exitosamente!');
            });
    }

    componentWillReceiveProps(newProps) {
        var patient = newProps.patient;

        if (patient) {
            this.setState({
                patientName: patient.name,
                patientEmail: patient.email,
                patientDNI: patient.DNI,
                patientDOB: patient.DOB,
                patientPostalCode: patient.postalCode,
                patientAddress: patient.address,
                patientOSaffiliateNumber: patient.osAffiliateNumber,
                patientOSname: osutils.getNameById(patient.osId),
                patientOSplan: patient.osPlan,
                patientTel: patient.tel,
                patientMedicalHistory: patient.medicalHistory,
                patient: patient
            })

        }
    }

    render() {
        return (
            <form onSubmit={this.submit.bind(this)}>
                <div className="form-group">
                    <label>Nombre y Apellido</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ejemplo: Juanito Perez"
                        name="patientName"
                        required
                        valueLink={this.linkState('patientName')}
                        />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Ejemplo: juan_perez@pokemart.com.ar"
                        name="patientEmail"
                        valueLink={this.linkState('patientEmail')}
                        />
                </div>

                <div className="form-group">
                    <label>DNI</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ejemplo: 123456789"
                        required
                        name="patientDNI"
                        valueLink={this.linkState('patientDNI')}
                        />
                </div>

                <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input
                        type="date"
                        className="form-control"
                        required
                        name="patientDOB"
                        valueLink={this.linkState('patientDOB')}
                        />
                </div>

                <div className="form-group">
                    <label>Telefono</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ejemplo: Tel: 01234 123566, Cel: 011 15 12345677"
                        required
                        name="patientTel"
                        valueLink={this.linkState('patientTel')}
                        />
                </div>

                <fieldset className="addressForm">
                    <h3>Domicilio</h3>

                    <div className="form-group">
                        <label>Provincia</label>
                        <Typeahead
                            options={argutils.provinces}
                            maxVisible={5}
                            placeholder="Ingresa las primeras letras y selecciona"
                            customClasses={typeaheadClasses}
                            onOptionSelected={this.onProvinceSelected.bind(this)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Localidad</label>
                        <Typeahead
                            options={this.state.locOptions}
                            maxVisible={5}
                            placeholder="Ingresa las primeras letras y selecciona"
                            customClasses={typeaheadClasses}
                            onOptionSelected={this.onLocalitySelected.bind(this)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Codigo Postal</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Se completa seleccionando una localidad"
                            disabled
                            name="patientPostalCode"
                            valueLink={this.linkState('patientPostalCode')}
                            />
                    </div>

                    <div className="form-group">
                        <label>Direccion</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ejemplo: Av Siempre Viva 123"
                            required
                            name="patientAddress"
                            valueLink={this.linkState('patientAddress')}
                            />
                    </div>

                </fieldset>

                {/*TODO: suggest that the placeholder value is the selected value and that
                the user can input the first letters to search for a new option and erase the input to
                get the default */}
                <fieldset className="osForm">
                    <h3>Datos de Obra Social</h3>
                    {this.state.patientOSname}
                    <div className="form-group typeahead-os">
                        <label>Obra Social</label>
                        {
                            /*
                            TODO: work with this in order to not allow custom values.
                            This option will avoid triggering the onOptionSelected event, but the input will not show any
                            messages or visual feedback to the user about the error
                            */
                        }
                        <Typeahead
                            options={this.state.OSoptions}
                            maxVisible={2}
                            allowCustomValues={1000000}
                            placeholder={this.state.patientOSname || "Ingresa las primeras letras y selecciona"}
                            defaultValue={this.state.patientOSname}
                            customClasses={typeaheadClasses}
                            onOptionSelected={this.onOSselected.bind(this)}
                        />
                    </div>

                    {/*TODO: require this fields below if the OS is distinct from Particular*/}

                    <div className="form-group">
                        <label>Numero de Socio</label>
                        <input
                            valueLink={this.linkState('patientOSaffiliateNumber')}
                            name="patientOSaffiliateNumber"
                            type="text"
                            className="form-control"
                            placeholder="Numero de Socio"
                            />
                    </div>

                    <div className="form-group">
                        <label>Plan</label>
                        <input
                            valueLink={this.linkState('patientOSplan')}
                            name="patientOSplan"
                            type="text"
                            className="form-control"
                            placeholder="Plan"
                            />
                    </div>
                </fieldset>

                <div className="form-group">
                    <label>Historia Clinica</label>
                    <textarea
                        className="form-control"
                        rows="3"
                        name="patientMedicalHistory"
                        valueLink={this.linkState('patientMedicalHistory')}
                        >
                    </textarea>
                </div>
                <button type="submit" className="btn btn-primary">Aceptar</button>
                <button type="button" className="btn btn-danger">Borrar</button>
            </form>
        );
    }
}


ReactMixin(PatientForm.prototype, React.addons.LinkedStateMixin);
