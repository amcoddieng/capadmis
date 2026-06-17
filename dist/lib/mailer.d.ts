export interface MailOptions {
    to: string;
    subject: string;
    message?: string;
    html?: string;
}
export declare function sendMail({ to, subject, message, html }: MailOptions): Promise<void>;
//# sourceMappingURL=mailer.d.ts.map