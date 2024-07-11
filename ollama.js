export class OllamaRequest {
    model = "";
    signal = null;
    stream = true;
    messages = [];
    prompt = "";
    options = {}
    system = ''

    constructor(obj) {
        Object.assign(this, obj);
    }
}

/**
 * Lightweight version of https://www.npmjs.com/package/ollama
*/
export class Ollama {
    base = "http://localhost:11434/api";

    /**
     * 
     * @param {*} body 
     * @param {*} param1 
     * @returns 
     * @example 
const response = await ollama.chat({ model: 'llama2', prompt: 'Why is the sky blue?', stream: true })
for await (const part of response) {
    console.log(part.message.content)
}
     */
    async chat(body = new OllamaRequest, {signal}) {
        const resp = await fetch(`${this.base}/generate`, {
            method: "POST",
            signal: signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return this.streamer(resp);
    }

    /**
     * https://github.com/ollama/ollama-js/blob/main/src/utils.ts#L216
     * @param {*} resp 
     * @returns 
     */
    async* streamer(resp) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let data = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const text = decoder.decode(value, { stream: true });
            // const parts = buffer.split('\n')
            const json = JSON.parse(text);
            yield json;

            data.push(json);
        }
        return data;
    }
}

export default Ollama;
