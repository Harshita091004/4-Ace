const express = require('express');
const router = express.Router();
const { getTranslation, getModuleTranslations, getAvailableLanguages } = require('../ai/i18n');

// Get all available languages
router.get('/languages', (req, res) => {
  try {
    const languages = getAvailableLanguages();
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get translation for a specific key
router.get('/translate/:language/:module/:key', (req, res) => {
  try {
    const { language, module, key } = req.params;
    const translation = getTranslation(language, module, key);

    res.json({
      language,
      module,
      key,
      translation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all translations for a module
router.get('/module/:language/:module', (req, res) => {
  try {
    const { language, module } = req.params;
    const translations = getModuleTranslations(language, module);

    res.json({
      language,
      module,
      translations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
