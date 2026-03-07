import { createChatModel } from "./lc-models";
import { AskResult, AskResultSchema } from "./schema";

export async function askStructured(query:string): Promise<AskResult> {
    const {model} = createChatModel(); 

    const system = "You are a helpful assistant. Return only the requested JSON.";

    const user = ` Summirary the following text:\n 
     ${query} 
        Return fields: summary (short paragraph), confidence (0..1)
     `;

     const structured = model.withStructuredOutput(AskResultSchema);

     const result = await structured.invoke([{role: 'system', content: system}, {role: 'user', content: user}]);
      
     return result

}