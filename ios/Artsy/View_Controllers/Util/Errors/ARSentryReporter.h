#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ARSentryReporter : NSObject

+ (void)reportProblemForUserID:(NSString *)userID
                        inSale:(NSString *)saleID
               withDescription:(NSString *)description;

@end

NS_ASSUME_NONNULL_END
