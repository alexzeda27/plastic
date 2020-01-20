'use strict'

//Importamos el modelo de mobilidad
var Mobilitie = require('../models/mobility');
//Importamos el modelo de registro
var Register = require('../models/register');

//Creamos la función de home
function home(req, res)
{
    return res.status(200).send({
        message: "Bienvenido al servidor de NodeJS - Mobilities"
    });
}

//Función para crear registro
function createRegister(req, res)
{
    //Recogemos los datos por el body
    var params = req.body;

    //Creamos el objeto de registro
    var register = new Register();

    //Si el usuario llena todo el formulario
    if(params.month && params.week && params.day)
    {
        //Asignamos los valores al objeto
        register.month = params.month;
        register.week = params.week;
        register.day = params.day

        //EL objeto buscara documentos repetidos
        Register.find({day: register.day}, (err, registerRepeat) => {

            //Si existe un error en el servidor
            if(err) return res.status(500).send({
                message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
            });

            //Si existe un registro repetido
            if(registerRepeat && registerRepeat.length >= 1)
            {
                return res.status(406).send({
                    message: "Este registro ya existe con el día, prueba con otro."
                });
            }

            //Si no existen errores
            else
            {
                register.save((err, registerStored) => {

                    //Si existen errores en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
                    });

                    //Si existe un error al guardar el registro
                    if(!registerStored) return res.status(406).send({
                        message: "Ocurrio un error al guardar el registro. Intentalo de nuevo más tarde."
                    });

                    //Si no existen errores
                    else
                    {
                        return res.status(201).send({register: registerStored});
                    }
                })
            }
        });
    }

    //Si el usuario no llena todo el formulario
    else
    {
        return res.status(406).send({
            message: "No puedes dejar campos vacios en el registro."
        });
    }
}

//Función para listar todos los registros
function getRegisters(req, res)
{
    //EL objeto buscara el documento
    Register.find((err, registers) => {

        //Si existen errores en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
        });

        //Si no encuentra los documentos
        if(!registers) return res.status(404).send({
            message: "No se encontró ningun registro."
        });

        //Si no existen errores
        return res.status(200).send({registers});
    });
}

//Función para actualizar registros
function updateRegister(req, res)
{
    //Obtenemos el id del registro por parametro
    var registerId = req.params.id;

    //Obtenemos los datos por el body
    var update = req.body;

    //Si el usuario llena todo el formulario
    if(update.month && update.week && update.day)
    {
        //El objeto buscara coincidencias
        Register.find({day: update.day}, (err, registerRepeat) => {

            //Si existen errores en el servidor
            if(err) return res.status(500).send({
                message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
            });

            //Si el registro se repite
            if(registerRepeat && registerRepeat.length >= 1)
            {
                return res.status(406).send({
                    message: "No puedes actualizar este registro porque el día ya existe."
                });
            }

            //Si no existen errores
            else
            {
                //El objeto actualizara el registro
                Register.findByIdAndUpdate(registerId, update, {new: true}, (err, registerUpdated) => {

                    //Si existen errores en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
                    });

                    //Si existe un error al actualizar el registro
                    if(!registerUpdated) return res.status(406).send({
                        message: "Hubo un error al actualizar este registro. Intentelo de nuevo."
                    });

                    //Si no existen errores
                    return res.status(201).send({update: registerUpdated});
                })
            }
        })
    }

    //Si el usuario no llena todo el formulario
    else
    {
        return res.status(406).send({
            message: "No puedes dejar campos vacios en el formulario."
        });
    }
}

//Función para eliminar registros
function removeRegister(req, res)
{
    //Recogemos el id por parametro
    var registerId = req.params.id;

    //El objeto buscara el documento y lo eliminara
    Register.findByIdAndRemove(registerId, (err, registerDeleted) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
        });

        //Si existe un error al eliminar el registro
        if(!registerDeleted) return res.status(406).send({
            message: "Ocurrio un error al eliminar este registro. Intentelo de nuevo."
        });

        //Si no existen errores
        return res.status(200).send({
            message: "Registro eliminado correctamente."
        });
    });
}

//Función para crear movilidad
function createMobility(req, res)
{
    //Recogemos los datos por el body
    var params = req.body;
    
    //Creamos el objeto de movilidad
    var mobilitie = new Mobilitie();

    //Si el usuario llena todo el formulario
    if(params.hour && params.indicator && params.observations && params.department && 
        params.square && params.machine && params.operator && params.register)
    {
        //Añadimos los valores al objeto
        mobilitie.hour = params.hour;
        mobilitie.indicator = params.indicator;
        mobilitie.observations = params.observations;
        mobilitie.department = params.department;
        mobilitie.square = params.square;
        mobilitie.machine = params.machine;
        mobilitie.operator = params.operator;
        mobilitie.register = params.register;

        //El objeto buscara que los registros no repitan las horas
        Mobilitie.find({hour: mobilitie.hour}, (err, mobilitieRepeat) => {

            //Si existe un error en el servidor
            if(err) return res.status(500).send({
                message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
            });

            //Si existen repetidos
            if(mobilitieRepeat && mobilitieRepeat >= 1)
            {
                return res.status(406).send({
                    message: "No puedes haber dos regitros en la misma hora."
                });
            }

            //Si no hay repetidos
            else
            {
                mobilitie.save((err, mobilitieStored) => {

                    //Si existe un error en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en el servidor. Intentalo de nuevo más tarde."
                    });

                    //Si existe un error al guardar el registro
                    if(!mobilitieStored) return res.status(406).send({
                        message: "Ocurrio un errro al guardar el registro. Intentalo de nuevo."
                    });

                    //Si no existen errores
                    return res.status(201).send({mobilitie: mobilitieStored});
                });
            }
        });
    }

    //Si el usuario no llena todo el formulario
    else
    {
        return res.status(400).send({
            message: "No puedes dejar campos vacios en el formulario."
        });
    }
}

//Función de listado de movilidad
function getMobility(req, res)
{
    //El objeto obtendra el array de todos sus elementos
    Mobilitie.find().populate([{path: 'department'}, {path: 'square', populate: [{path: 'department'}]}, 
    {path: 'machine', populate: [{path: 'square'}]}, {path: 'operator', populate: [{path: 'square'}, 
    {path: 'machine'}, {path: 'employee'}]}, {path: 'register'}]).exec((err, mobilities) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en el servidor. Intentalo más tarde."
        });

        //Si no encuentra registros
        if(!mobilities) return res.status(404).send({
            message: "No se encontraron registros."
        });

        //Si no existen errores
        return res.status(200).send({mobilities});
    });
}

//Exportamos los métodos
module.exports = {
    home,
    createRegister,
    getRegisters,
    updateRegister,
    removeRegister,
    createMobility,
    getMobility
}
