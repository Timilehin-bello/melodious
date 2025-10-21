import Joi from "joi";

const completeAd = {
  body: Joi.object().keys({
    adId: Joi.number().integer().required(),
  }),
};

const createAd = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    imageUrl: Joi.string().uri().required(),
    audioUrl: Joi.string().uri().required(),
    duration: Joi.number().integer().min(1).required(),
    isActive: Joi.boolean(),
  }),
};

const updateAd = {
  params: Joi.object().keys({
    adId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    imageUrl: Joi.string().uri(),
    audioUrl: Joi.string().uri(),
    duration: Joi.number().integer().min(1),
    isActive: Joi.boolean(),
  }).min(1),
};

const adValidation = { completeAd, createAd, updateAd };
export default adValidation;