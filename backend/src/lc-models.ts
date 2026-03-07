import { ChatGoogle } from '@langchain/google';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { loadEnv } from './env';


export type Provider = 'gemini' | 'groq' | 'openai'

export  function createChatModel():{
    provider: Provider,model: any
} {
    loadEnv()

    const forced = (process.env.PROVIDER || "").toLocaleLowerCase();
    const hasOpenAI = !!process.env.OPENAI_API_KEY ;
    const hasGemini = !!process.env.GOOGLEAI_API_KEY;
    const hasGroq = !!process.env.GROQAI_API_KEY ;

    const base ={temperature: 1 } as const

    if(forced === 'openai' || (!forced && hasOpenAI)){
        return {
            provider: 'openai',
            model: new ChatOpenAI({
                ...base,
                model:'gpt-5-nano'
            })
        }
    }

    if(forced === 'gemini' || (!forced && hasGemini)){
        return {
            provider: 'gemini',
            model: new ChatGoogle({
                ...base,
                model:'gemini-2.5-flash-lite'
            })
        }
    }

    if(forced === 'groq' || (!forced && hasGroq)){
        return {
            provider: 'groq',
            model: new ChatGroq({
                ...base,
                model:'llama-3.1-8b-instant'
            })
        }
    }

    return { provider: 'gemini',
            model: new ChatGoogle({
                ...base,
                model:'gemini-2.5-flash-lite'
            })}

}