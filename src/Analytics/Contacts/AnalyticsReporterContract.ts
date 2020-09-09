import { Result } from '@vladbasin/ts-result';
import { Maybe } from '@vladbasin/ts-types';
import { UserType } from '../Types/UserType';

export interface AnalyticsReporterContract {
    initializeAsync(): Result<void>;
    reportCurrentScreen(name: string): void;
    reportUser(user: Maybe<UserType>): void;
    reportLogin(): void;
    reportSignup(): void;
    reportEvent(name: string, params?: { [key: string]: string | number | boolean }): void;
    reportException(description: Maybe<string>, fatal: Maybe<boolean>): void;
    reportEventAsync(name: string, params?: { [key: string]: string | number | boolean }): Result<void>;
}