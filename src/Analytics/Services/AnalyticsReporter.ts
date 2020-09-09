import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { Result } from '@vladbasin/ts-result';
import { MonitorContract } from '@vladbasin/ts-services';
import { Maybe } from '@vladbasin/ts-types';
import { isNil } from 'lodash';
import { AnalyticsReporterContract } from '../Contacts/AnalyticsReporterContract';
import { AnalyticsConfigurationType } from '../Types/AnalyticsConfigurationType';
import { UserType } from '../Types/UserType';

const JsAppVersionAttribute = "jsAppVersion";

export class AnalyticsReporter implements AnalyticsReporterContract {
    private readonly _monitor: MonitorContract;
    private readonly _analyticsConfiguration: AnalyticsConfigurationType;

    constructor(dep: {
        monitor: MonitorContract,
        analyticsConfiguration: AnalyticsConfigurationType,
    }) {
        this._monitor = dep.monitor;
        this._analyticsConfiguration = dep.analyticsConfiguration;

        this.setEnabled(this._analyticsConfiguration.analyticsEnabled);
    }

    public initializeAsync(): Result<void> {
        const promise = Promise.all([
            analytics().setUserProperty(JsAppVersionAttribute, this._analyticsConfiguration.version),
            crashlytics().setAttribute(JsAppVersionAttribute, this._analyticsConfiguration.version),
        ]);

        return Result.FromPromise(promise).recover();
    }

    public reportException(description: Maybe<string>, fatal: Maybe<boolean>) {
        this.reportAndForget(analytics().logEvent("exception", {
            description,
            fatal,
        }));
    }

    public reportEvent(name: string, params?: { [key: string]: string | number | boolean }) {
        this.reportAndForget(analytics().logEvent(name, params));
    }

    public reportEventAsync(name: string, params?: { [key: string]: string | number | boolean }) {
        this.reportEvent(name, params);

        return Result.Void();
    }

    public reportCurrentScreen(name: string) {
        analytics().setCurrentScreen(name)
    }

    public reportLogin() {
        this.reportAndForget(analytics().logLogin({ method: "basic" }));
    }

    public reportSignup() {
        this.reportAndForget(analytics().logSignUp({ method: "basic" }));
    }

    public reportUser(user: Maybe<UserType>): void {
        this.reportUserForAnalytics(user);
        this.reportUserForCrashlytics(user);
    }

    public setEnabled(enabled: boolean) {
        analytics().setAnalyticsCollectionEnabled(enabled);
    }

    private reportUserForCrashlytics(user: Maybe<UserType>): void {
        const service = crashlytics();

        const promise = Promise.all([
            service.setUserId(user && user.id || ""),
        ]);

        this.reportAndForget(promise);
    }

    private reportUserForAnalytics(user: Maybe<UserType>): void {
        const service = analytics();

        if (isNil(user)) {
            Result.FromPromise(service.resetAnalyticsData()).run();

            return;
        }

        const promise = Promise.all([
            service.setUserId(user.id || ""),
            service.setUserProperty("firstName", user.firstName || ""),
            service.setUserProperty("lastName", user.lastName || ""),
            service.setUserProperty("userName", user.userName || ""),
            service.setUserProperty("locale", user.locale || ""),
            service.setUserProperty(JsAppVersionAttribute, this._analyticsConfiguration.version),
        ]);

        this.reportAndForget(promise);
    }

    private reportAndForget(promise: Promise<any>) {
        Result.FromPromise(promise).run();
    }
}