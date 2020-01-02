'use strict'

//Cargamos el modelo de supervisores
var Supervisor = require('../models/supervisor');
//Cargamos el modelo de bloques
var Square = require('../models/square');
//Cargamos el modelo de maquinas
var Machine = require('../models/machine');
//Cargamos el modelo de operadores
var Operator = require('../models/operator');

//Función principal
function home(req, res)
{
    return res.status(200).send({
        message: "Hola mundo desde el servidor de NodeJS - Supervisor"
    });
}

//Función para obtener a los supervisores
function getSupervisor(req, res)
{
    //Obtenemos el id por parametro
    var supervisorId = req.params.id;

    Supervisor.findById(supervisorId).populate({path: 'employee',
    populate: [{path: 'position', populate: [{path: 'typeWorker'}, {path: 'costCenter'}]},
    {path: 'department'}]}).exec((err, supervisors) => {

        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo más tarde."
        });

        if(!supervisors) return res.status(404).send({
            message: "No se encontro el supervisor. Verifique la información."
        });

        return res.status(200).send({supervisors});
    });
}

//Función para obtener supervisores paginados
function getSupervisors(req, res)
{
    //Inicializamos la página en 1
    var page = 1;

    //Si se obtienen los parametros de la página
    if(req.params.page)
    {
        //obtenemos los valores que se pasen por parametro
        page = req.params.page;
    }

    //Objetos por página son 10
    var itemsPerPage = 10;

    //El objeto busca por el documento y despliega su contenido
    Supervisor.find().sort('_id').populate({path: 'employee', 
    populate: [{path: 'position', populate: [{path: 'typeWorker'}, {path: 'costCenter'}]}, 
    {path: 'department'}]}).paginate(page, itemsPerPage, (err, supervisors, total) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo de nuevo más tarde."
        });

        //Si no hay usuarios registrados
        if(!supervisors) return res.status(404).send({
            message: "No hay registros de empleados."
        });

        //Si no existen errores
        else
        {
            //Si no existen errores, muestra los objetos paginados
            return res.status(200).send({
                supervisors,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        }
    });
}

//Función para crear bloques
function saveSquare(req, res)
{
    //Recogemos los elementos que pasan por body
    var params = req.body;

    //Creamos el objeto de Square
    var square = new Square();

    //Si el supervisor llena todo el formulario
    if(params.department)
    {
        //Al objeto le asignamos los valores del body
        square.department = params.department;

        //El objeto buscara por el documento
        Square.find({department: square.department}, (err, squareRepeat) => {

            //Si existe un error en el servidor
            if(err) return res.status(500).send({
                message: "Hubo un error en la petición del servidor. Intentalo más tarde."
            });

            //Si el número de bloque y departamento se repiten
            if(squareRepeat && squareRepeat.length >= 1)
            {
                return res.status(200).send({
                    message: "El número de bloque ya esta registrado con este departamento. Verifique su información."
                });
            }

            //Si no existen errores
            else
            {
                //El objeto guardara el documento
                square.save((err, squareStored) => {

                    //Si existe un error en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en la petición del servidor. Intentalo más tarde."
                    });

                    //Si existe un error al guardar el registro
                    if(!squareStored) return res.status(404).send({
                        message: "Surgio un error al crear este bloque. Intentelo de nuevo."
                    });

                    //Si no existen errores
                    return res.status(200).send({square: squareStored});
                });
            }
        });
    }
}

//Función para mostrar los bloques existentes
function getSquare(req, res)
{
    //Recogemos el id por parametro
    var squareId = req.params.id;

    //El objeto buscara por el documento
    Square.findById(squareId).populate({path: 'department'}).exec((err, squares) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo más tarde."
        });

        //Si el bloque no existe en la base de datos
        if(!squares) return res.status(404).send({
            message: "Este bloque no existe. Verifica tu información."
        });

        //Si no existen errores, el objeto retornara la información solicitada
        return res.status(200).send({squares});
    });
}

//Función para mostrar los bloques paginados
function getSquares(req, res)
{
    //Inicializamos la página en 1
    var page = 1;

    //Si se obtienen los parametros de la página
    if(req.params.page)
    {
        //obtenemos los valores que se pasen por parametro
        page = req.params.page;
    }

    //Objetos por página son 10
    var itemsPerPage = 10;

    //El objeto busca por el documento y despliega su contenido
    Square.find().sort('_id').populate({path: 'department'}).paginate(page, itemsPerPage, (err, squares, total) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo de nuevo más tarde."
        });

        //Si no hay usuarios registrados
        if(!squares) return res.status(404).send({
            message: "No hay registros de empleados."
        });

        //Si no existen errores
        else
        {
            //Si no existen errores, muestra los objetos paginados
            return res.status(200).send({
                squares,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        }
    });
}

//Función para actualizar el departamento del bloque
function updateSquares(req, res)
{
    //Recogemos la id del bloque por parametro
    var squareId = req.params.id;
    //Recogemos los datos del body
    var update = req.body;

    //El objeto Bloque buscara por el documento
    Square.find({department: update.department}, (err, squareRepeat) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo de nuevo más tarde."
        });

        //Si el documento se repite
        if(squareRepeat && squareRepeat.length >= 1)
        {
            return res.status(200).send({
                message: "No puedes actualizar a este departamento porque ya existe."
            });
        }

        //Si no existen errores
        else
        {
            //Si quiere actualiza el número de bloque
            if(update.numberSquare) return res.status(403).send({
                message: "No se puede realizar esta operación. Solo puedes actualizar el departamento."
            });

            //Si actualiza el departamento
            else
            {
                //Buscaremos el id correspondiente
                Square.findByIdAndUpdate(squareId, update, {new:true}, (err, departmentUpdated) => {

                    //Si existe un error en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en la petición del servidor. Intentalo más tarde. 1"
                    });

                    //Si no se puede actualizar el departamento
                    if(!departmentUpdated) return res.status(404).send({
                        message: "Ocurrio un error al actualizar el departamento. Intentalo de nuevo."
                    });

                    //Si no existen errores
                    return res.status(201).send({update: departmentUpdated});
                });         
            }
        }
    });
}

//Función para eliminar un bloque
function removeSquare(req, res)
{
    //Recogemos el id por parametro
    var squareId = req.params.id;

    //El objeto buscara por el documento
    Square.findByIdAndRemove(squareId, (err, squareDeleted) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo más tarde."
        });

        //Si existe un error al eliminar el bloque
        if(!squareDeleted) return res.status(404).send({
            message: "No se pudo eliminar el bloque. Intentalo de nuevo."
        });

        //Si existen errores
        return res.status(201).send({
            message: "Bloque eliminado correctamente."
        });
    });
}

//Función para añadir números de bloques
function addNumberSquare(req, res)
{
    //Recogemos el id por parametro
    var squareId = req.params.id;

    //Recogemos los datos del body
    var update = req.body;

    //El objeto buscara el documento con el id
    Square.findById(squareId, (err, numberUpdated) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo más tarde."
        });

        //Si el objeto no encuentra el documento
        if(!numberUpdated) return res.status(404).send({
            message: "No se ha encontrado el bloque. Verifique su información."
        });

        else
        {
            //Creamos una bandera
            var flag = false;

            //El bucle recorrera nuestro arreglo de bloques
            for(var i = 0; i < numberUpdated.numberSquare.length; i++)
            {
                //Si encuentra una coincidencia
                if(numberUpdated.numberSquare[i] == update.numberSquare)
                {
                    //La bandera cambia a true
                    flag = true;
                }
            }

            //Si la bandera es true
            if(flag == true) return res.status(200).send({
                message: "No puedes ingresar este número de bloque porque ya existe en este departamento."
            });

            //Si la bandera sigue siendo false
            else
            {
                //Buscamos el ojeto el documento a actualizar
                Square.findByIdAndUpdate(squareId, {$push: {numberSquare: [update.numberSquare], $sort: {numberSquare: 1}}}, {new:true}, (err, squareUpdated) => {
                    
                    //Si existe un error en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en la petición del servidor. Intentalo más tarde."
                    });

                    //Si no se puede actualizar
                    if(!squareUpdated) return res.status(404).send({
                        message: "Ocurrio un error al actualizar un número de bloque. Intentalo de nuevo."
                    });

                    //Si no existen errores
                    else
                    {
                        return res.status(201).send({update: squareUpdated});
                    }
                });
            }
        }
    }); 
}

//Función para eliminar número de bloque
function removeNumberSquare(req, res)
{
    //Recogemos el id por parametro
    var squareId = req.params.id;

    //Recogemos los datos del body
    var update = req.body;

    //EL objeto busca por el id
    Square.findById(squareId, (err, squares) => {

        //Si existe un error en el servidor
        if(err) return res.status(500).send({
            message: "Hubo un error en la petición del servidor. Intentalo más tarde."
        });

        //Si el departamento no existe en la base de datos
        if(!squares) return res.status(404).send({
            message: "No se ha encontrado el departamento. Verifique su información."
        });

        //Si no existen errores
        else
        {
            //Creamos una variable bandera
            var flag = false;
            //Marcamos una poisición en 0
            var position = 0;

            //Creamos un bucle que recorre nuestro arreglo
            for(var i = 0; i < squares.numberSquare.length; i++)
            {
                //Si el numero del arreglo es igual al numero digitado
                if(squares.numberSquare[i] == update.numberSquare)
                {
                    //La bandera cambia a true
                    flag = true;
                    //La posicion toma el valor de i
                    position = i;
                    //Rompemos el bucle
                    break;
                }
            }

            //Si la bandera es falsa
            if(flag == false) return res.status(404).send({
                message: "No se ha encontrado el número de bloque solicitado."
            });

            //Si es verdadera
            else
            {
                //El objeto actualizara el nuevo numero de posición
                Square.findByIdAndUpdate(squareId, {$pull: {numberSquare: {$in: [squares.numberSquare[position]]}}}, (err, numberRemoved) => {

                    //Si existen errores en el servidor
                    if(err) return res.status(500).send({
                        message: "Hubo un error en la petición del servidor. Intentalo más tarde."
                    });

                    //Si ocurrio un error al eliminar
                    if(!numberRemoved) return res.status(404).send({
                        message: "Ocurrio un error al eliminar el número de bloque. Intentalo de nuevo."
                    });

                    //Si no existen errores
                    return res.status(201).send({
                        message: "Número de bloque eliminado con exito."
                    });
               }); 
            }
        }
    });
}

//Función para agregar maquinas
function saveMachine(req, res)
{
    
}

//Exportamos las funciones
module.exports = {
    home,
    getSupervisor,
    getSupervisors,
    saveSquare,
    getSquare,
    getSquares,
    updateSquares,
    removeSquare,
    addNumberSquare,
    removeNumberSquare
}