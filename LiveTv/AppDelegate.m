//
//  AppDelegate.m
//  LiveTv
//
//  Created by Brian Boyle on 31/08/2018.
//

#import "AppDelegate.h"

// tvBaseURL points to a server on your local machine. To create a local server for testing purposes, use the following command inside your project folder from the Terminal app: ruby -run -ehttpd . -p9001. See NSAppTransportSecurity for information on using a non-secure server.
//static NSString *tvBaseURL = @"file://LiveTV/";
//static NSString *tvBootURL = @"file://LiveTV/js/application.js";

@interface AppDelegate ()
    @property (nonatomic, strong) NSURL *rootURL;
    @property (nonatomic, strong) NSString *mainScript;
    @property (nonatomic, strong) TVApplicationController *tvAppController;
@end

@implementation AppDelegate

#pragma mark Javascript Execution Helper

- (void)executeRemoteMethod:(NSString *)methodName completion:(void (^)(BOOL))completion {
    [self.appController evaluateInJavaScriptContext:^(JSContext *context) {
        JSValue *appObject = [context objectForKeyedSubscript:@"App"];
        
        if ([appObject hasProperty:methodName]) {
            [appObject invokeMethod:methodName withArguments:@[]];
        }
    } completion:completion];
}

#pragma mark UIApplicationDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    TVApplicationControllerContext *tvAppContext = [[TVApplicationControllerContext alloc] init];
    
    // Set us up the main javascript file, and our root path
    tvAppContext.javaScriptApplicationURL = [[NSBundle mainBundle] URLForResource:@"application" withExtension:@"js"];
    self.rootURL = [tvAppContext.javaScriptApplicationURL URLByDeletingLastPathComponent];
    self.mainScript = @"index.js";
    
    // Set up our options
    NSMutableDictionary *dict = [launchOptions mutableCopy];
    if (!dict) dict = [[NSMutableDictionary alloc] initWithCapacity:1];
    [dict setObject:[self.rootURL absoluteString] forKey:@"baseURL"];
    [dict setObject:self.mainScript forKey:@"mainScript"];
    tvAppContext.launchOptions = dict;
    
    // Initialize the application controller
    self.tvAppController = [[TVApplicationController alloc] initWithContext:tvAppContext window:self.window delegate:self];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    [self executeRemoteMethod:@"onWillResignActive" completion: ^(BOOL success) {
        // ...
    }];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    [self executeRemoteMethod:@"onDidEnterBackground" completion: ^(BOOL success) {
        // ...
    }];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    [self executeRemoteMethod:@"onWillEnterForeground" completion: ^(BOOL success) {
        // ...
    }];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    [self executeRemoteMethod:@"onDidBecomeActive" completion: ^(BOOL success) {
        // ...
    }];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    [self executeRemoteMethod:@"onWillTerminate" completion: ^(BOOL success) {
        // ...
    }];
}

#pragma mark TVApplicationControllerDelegate

- (void)appController:(TVApplicationController *)appController didFinishLaunchingWithOptions:(nullable NSDictionary<NSString *, id> *)options {
    NSLog(@"appController:didFinishLaunchingWithOptions: invoked with options: %@", options);
}

- (void)appController:(TVApplicationController *)appController didFailWithError:(NSError *)error {
    NSLog(@"appController:didFailWithError: invoked with error: %@", error);
    
    NSString *title = @"Error Launching Application";
    NSString *message = error.localizedDescription;
    UIAlertController *alertController = [UIAlertController  alertControllerWithTitle:title message:message preferredStyle:UIAlertControllerStyleAlert];
    
    [self.appController.navigationController presentViewController:alertController animated:YES completion: ^() {
        // ...
    }];
}

- (void)appController:(TVApplicationController *)appController didStopWithOptions:(nullable NSDictionary<NSString *, id> *)options {
    NSLog(@"appController:didStopWithOptions: invoked with options: %@", options);
}

@end
