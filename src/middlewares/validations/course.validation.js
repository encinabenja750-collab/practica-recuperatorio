// * ARCHIVO A COMPLETAR
// * Imports y courseIdValidation ya resueltos
import { body, param } from "express-validator";
import Course from "../../models/course.model.js";
import Topic from "../../models/topic.model.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

export const courseIdValidation = [
  param("id").isMongoId().withMessage("El ID del curso no es válido"),
];

export const createCourseValidation = [
  body("title") // TODO 1: de 3 a 100 caracteres y único (custom con una consulta a la base).
    .trim()
    .notEmpty()
    .withMessage("El título no puede estar vacío")
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage("Debe tener entre 3 y 100 caracteres")
    .bail()
    .custom(async (value) => {
      const course = await Course.findOne({ title: value });
      if (course) {
        throw new Error("Ya existe un curso con ese título");
      }
      return true;
    }),

  body("description") // TODO 2: de 10 a 500 caracteres.
    .trim()
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .bail()
    .isLength({ min: 10, max: 500 })
    .withMessage("Debe tener entre 10 y 500 caracteres"),

  body("level") // TODO 3: opcional; valores permitidos: ["beginner", "intermediate", "advanced"].
    .optional()
    .trim()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("El nivel debe ser 'beginner', 'intermediate' o 'advanced' "),

  body("price") // TODO 4: opcional; número mayor o igual a 0.
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Debe ser un numero mayor a 0"),

  body("schedule.day") // TODO 5: valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"].
    .trim()
    .notEmpty()
    .withMessage("El dia es obligatorio")
    .bail()
    .isIn(["monday", "tuesday", "wednesday", "thursday", "friday"])
    .withMessage("Debe ser un dia válido"),

  body("schedule.startTime") // TODO 6: fecha válida (Date), obligatoria.
    .notEmpty()
    .withMessage("Debe colocar una fecha de inicio")
    .bail()
    .isISO8601()
    .withMessage("Debe colocar una fecha de inicio válida")
    .toDate(),

  body("schedule.endTime") // TODO 7: fecha válida (Date), obligatoria, y posterior a startTime (custom).
    .notEmpty()
    .withMessage("Debe colocar una fecha de fin")
    .bail()
    .isISO8601()
    .withMessage("Debe colocar una fecha de fin válida") //.isISO8601(): Es el método estándar de express-validator para validar fechas y horas (ej: "2026-11-18T18:00:00Z").
    .toDate() //Convierte ese string que llega en el JSON a un objeto Date real de JavaScript para que Mongoose lo guarde sin drama.
    .bail() //corta acá si algo salió mal
    .custom((value, { req }) => {
      const startTime = req.body.schedule?.startTime;
      if (startTime && new Date(value) <= new Date(startTime)) {
        //El new Date se usa para poder comparar estas dos fechas
        throw new Error("La fecha de fin debe ser posterior a la de inicio");
      }
      return true;
    }),

  body("teacher") // TODO 8: obligatorio; ID de MongoDB válido y el teacher debe existir y estar activo, es decir, con deletedAt null (custom).
    .notEmpty()
    .withMessage("El profesor es obligatorio")
    .bail()
    .isMongoId()
    .withMessage("El ID del profesor debe ser válido")
    .bail()
    .custom(async (value) => {
      const teacher = await User.findById(value);
      if (!teacher || teacher.deletedAt !== null) {
        throw new Error("El profesor no existe o no está activo");
      }
      return true;
    }),

  body("topics") // TODO 9: opcional; array cuyos IDs existan en la base (custom).
    .optional()
    .isArray()
    .withMessage("Los topicos deben enviarse en un array")
    .bail()
    .custom(async (value) => {
      for (const topicId of value) {
        if (!mongoose.isValidObjectId(topicId)) {
          throw new Error(`El ID ${topicId} no es válido`);
        }
        const topic = await Topic.findById(topicId);
        if (!topic) {
          throw new Error(`El tópico con el ID ${topicId} no existe`);
        }
      }
      return true;
    }),
];

export const updateCourseValidation = [
  param("id") // TODO 10: validar con isMongoId().
    .isMongoId()
    .withMessage("El ID del curso no es válido"),

  body("title") // TODO 11: igual que en la creación, pero opcional. La unicidad debe excluir al propio curso.
    .optional()
    .trim()
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage("Debe tener entre 3 y 100 caracteres")
    .bail()
    .custom(async (value, { req }) => {
      const course = await Course.findOne({ title: value }); //Si encuentra otro curso con ese id significa que ya está ocupado
      if (course && course._id.toString() !== req.params.id) {
        throw new Error("Ya existe un curso con ese título");
      }
      return true;
    }),

  body("description") // TODO 12: igual que en la creación, pero opcional.
    .optional()
    .trim()
    .bail()
    .isLength({ min: 10, max: 500 })
    .withMessage("Debe tener entre 10 y 500 caracteres"),

  body("level") // TODO 13: igual que en la creación, pero opcional (valores permitidos: ["beginner", "intermediate", "advanced"]).
    .optional()
    .trim()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("El nivel debe ser 'beginner', 'intermediate' o 'advanced' "),

  body("price") // TODO 14: igual que en la creación, pero opcional.
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Debe ser un numero mayor a 0"),

  body("schedule.day") // TODO 15: igual que en la creación, pero opcional (valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"]).
    .optional()
    .trim()
    .isIn(["monday", "tuesday", "wednesday", "thursday", "friday"])
    .withMessage("Debe ser un dia válido"),

  body("schedule.startTime") // TODO 16: igual que en la creación, pero opcional.
    .optional()
    .isISO8601()
    .withMessage("Debe colocar una fecha de inicio válida")
    .toDate(),

  body("schedule.endTime") // TODO 17: igual que en la creación, pero opcional (y posterior a startTime si ambos llegan).
    .optional()
    .isISO8601()
    .withMessage("Debe colocar una fecha de fin válida") //.isISO8601(): Es el método estándar de express-validator para validar fechas y horas (ej: "2026-11-18T18:00:00Z").
    .toDate() //Convierte ese string que llega en el JSON a un objeto Date real de JavaScript para que Mongoose lo guarde sin drama.
    .bail() //corta acá si algo salió mal
    .custom((value, { req }) => {
      const startTime = req.body.schedule?.startTime;
      if (startTime && new Date(value) <= new Date(startTime)) {
        //El new Date se usa para poder comparar estas dos fechas
        throw new Error("La fecha de fin debe ser posterior a la de inicio");
      }
      return true;
    }),

  body("teacher") // TODO 18: igual que en la creación, pero opcional.
    .optional()
    .isMongoId()
    .withMessage("El ID del profesor debe ser válido")
    .bail()
    .custom(async (value) => {
      const teacher = await User.findById(value);
      if (!teacher || teacher.deletedAt !== null) {
        throw new Error("El profesor no existe o no está activo");
      }
      return true;
    }),

  body("topics") // TODO 19: igual que en la creación, pero opcional.
    .optional()
    .isArray()
    .withMessage("Los topicos deben enviarse en un array")
    .bail()
    .custom(async (value) => {
      for (const topicId of value) {
        if (!mongoose.isValidObjectId(topicId)) {
          throw new Error(`El ID ${topicId} no es válido`);
        }
        const topic = await Topic.findById(topicId);
        if (!topic) {
          throw new Error(`El tópico con el ID ${topicId} no existe`);
        }
      }
      return true;
    }),
];
