"""
Dynamic Translation Service
Translates AI responses, notes, and lessons to selected language
"""
from fastapi import HTTPException
from googletrans import Translator
import asyncio
from functools import lru_cache

# Initialize translator
translator = Translator()

# Language code mapping
LANG_CODES = {
    'en': 'en',  # English
    'hi': 'hi',  # Hindi
    'ar': 'ar',  # Arabic
    'as': 'as',  # Assamese
}

# Cache translated content to reduce API calls
@lru_cache(maxsize=1000)
def translate_text_cached(text: str, target_lang: str) -> str:
    """Cached translation to avoid repeated API calls"""
    if target_lang == 'en' or not text:
        return text
    
    try:
        result = translator.translate(text, dest=target_lang)
        return result.text
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return text  # Return original if translation fails

async def translate_text(text: str, target_lang: str = 'en') -> str:
    """
    Translate text to target language
    Uses Google Translate API
    """
    if not text or target_lang == 'en':
        return text
    
    try:
        # Run translation in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            translate_text_cached,
            text,
            target_lang
        )
        return result
    except Exception as e:
        print(f"Translation failed: {str(e)}")
        return text

async def translate_list(items: list, target_lang: str = 'en') -> list:
    """Translate a list of strings"""
    if target_lang == 'en':
        return items
    
    translated = []
    for item in items:
        if isinstance(item, str):
            translated.append(await translate_text(item, target_lang))
        else:
            translated.append(item)
    return translated

async def translate_dict(data: dict, keys_to_translate: list, target_lang: str = 'en') -> dict:
    """Translate specific keys in a dictionary"""
    if target_lang == 'en':
        return data
    
    result = data.copy()
    for key in keys_to_translate:
        if key in result and isinstance(result[key], str):
            result[key] = await translate_text(result[key], target_lang)
    return result

async def translate_ai_prompt(prompt: str, target_lang: str = 'en') -> str:
    """
    Prepare AI prompt to generate response in target language
    """
    if target_lang == 'en':
        return prompt
    
    lang_names = {
        'hi': 'Hindi (हिंदी)',
        'ar': 'Arabic (العربية)',
        'as': 'Assamese (অসমীয়া)'
    }
    
    lang_instruction = f"\n\nIMPORTANT: Please respond ONLY in {lang_names.get(target_lang, target_lang)}. Do not use English."
    return prompt + lang_instruction

def get_language_specific_voice_config(lang: str) -> dict:
    """Get voice configuration for SARA lip-sync based on language"""
    configs = {
        'en': {
            'rate': 0.9,
            'pitch': 1.0,
            'voice_name': 'en-US',
            'viseme_timing': 'standard'
        },
        'hi': {
            'rate': 0.85,
            'pitch': 1.1,
            'voice_name': 'hi-IN',
            'viseme_timing': 'slower'
        },
        'ar': {
            'rate': 0.8,
            'pitch': 0.95,
            'voice_name': 'ar-SA',
            'viseme_timing': 'slower'
        },
        'as': {
            'rate': 0.85,
            'pitch': 1.05,
            'voice_name': 'as-IN',
            'viseme_timing': 'slower'
        }
    }
    return configs.get(lang, configs['en'])
