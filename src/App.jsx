import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";
import twist from "./assets/twist.png";

function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("si");
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const languageNames = {
    en: "English", si: "Sinhala", es: "Spanish", fr: "French", 
    de: "German", it: "Italian", ja: "Japanese", pt: "Portuguese", 
    ru: "Russian", ko: "Korean", ar: "Arabic", hi: "Hindi"
  };

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://translation.googleapis.com/language/translate/v2/languages`,
        {
          params: {
            key: API_KEY,
            target: "en",
          },
        }
      );

      const languagesWithFullNames = response.data.data.languages
        .map((lang) => ({
          code: lang.language,
          name: languageNames[lang.language] || lang.language,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setLanguages(languagesWithFullNames);
    } catch (error) {
      setError("Failed to fetch languages. Please check your connection.");
    }
  }, [API_KEY]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to translate.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          q: inputText,
          source: sourceLang,
          target: targetLang,
          format: "text",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setTranslatedText(response.data.data.translations[0].translatedText);
    } catch (error) {
      setError("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText("");
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container">
      <img src={twist} alt="Twist" style={{ width: "200px", height: "auto" }} />
      <h1 className="app-title">Translator</h1>
      <div className="language-selector">
        <select
          className="language-dropdown"
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button className="swap-btn" onClick={swapLanguages} title="Swap Languages">
          ⇆
        </button>
        <select
          className="language-dropdown"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="input-container">
        <textarea
          className="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate..."
        ></textarea>
        {inputText && (
          <button 
            className="copy-btn" 
            onClick={() => copyText(inputText)}
            title="Copy Input"
          >
            📋
          </button>
        )}
      </div>

      <button 
        className="translate-btn" 
        onClick={handleTranslate} 
        disabled={isLoading}
      >
        {isLoading ? "Translating..." : "Translate"}
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="output-container">
        <div className="output-text">
          {translatedText || "Translated text will appear here..."}
        </div>
        {translatedText && (
          <button 
            className="copy-btn" 
            onClick={() => copyText(translatedText)}
            title="Copy Translation"
          >
            📋
          </button>
        )}
      </div>
    </div>
  );
}

export default App;