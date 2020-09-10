import { Embed } from '../model/Embed'
import { EmbedField } from '../model/EmbedField'
import { BaseProvider } from '../provider/BaseProvider'

class Sentry extends BaseProvider {

    private static capitalize(str: string) {
        const tmp = str.toLowerCase()
        return tmp.charAt(0).toUpperCase() + tmp.slice(1)
    }

    public getName() {
        return 'Sentry'
    }

    public getPath() {
        return 'sentry'
    }

    public async parseData() {
        const COLORS = {
            debug: parseInt('fbe14f', 16),
            info: parseInt('2788ce', 16),
            warning: parseInt('f18500', 16),
            error: parseInt('e03e2f', 16),
            fatal: parseInt('d20f2a', 16),
        };


        this.setEmbedColor(COLORS[this.body.level] || COLORS.error)
        const embed = new Embed()

        embed.title = `[${this.body.project_name}] ${this.body.event.title}`
        embed.url = this.body.url
        embed.type = "rich"
        embed.description = this.body.message
        embed.timestamp = new Date(this.body.event.received * 1000).toISOString()

        try {
            let stack_trace = "\n"
            this.body.event.exception.values[0].stacktrace.frames.forEach((frame) => {
                let line = `${frame.module} in ${frame.function} at line ${frame.lineno}\n\`\`\`${frame.pre_context.join("\n")}\n${frame.context_line}\n${frame.post_context.join("\n")}\n\`\`\``
                stack_trace += line
            });
            // embed.description += stack_trace
        } catch (error) {

        }


        embed.fields = []

        try {
            if (this.body.event.user) {
                const field = new EmbedField()
                field.name = '**User**'
                field.value = this.body.event.user.ip_address
                // embed.fields.push(field)
            }
        } catch (error) {
            this.logger.error(error)
        }


        try {
            if (this.body.event.tags) {
                this.body.event.tags.forEach(([key, value]) => {
                    const field = new EmbedField()
                    field.name = key
                    field.value = value
                    field.inline = true
                    // embed.fields.push(field)
                });
            }
        } catch (error) {
            this.logger.error(error)
        }

        this.addEmbed(embed)
    }
}

export { Sentry }
