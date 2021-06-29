# kaholo-trigger-vsts
VSTS Trigger repo

The VSTS trigger is a webhook trigger for ***Azure DevOps git***.

## How To Use

After Installing the trigger on Kaholo make sure you also have a Service hook subscription for a Wehbook to relevent URL.
See more on Webhooks in azure git [here](https://docs.microsoft.com/en-us/azure/devops/service-hooks/services/webhooks?view=azure-devops).

## Trigger's methods:

### 1) VSTS Pull Request Webhook
This method envoked when a new Pull request is called. 
This Webhooks URL is: *\<Kaholo-URL\>/azuregit/webhook/pull-request* .

#### Method Parameters:
1) Repository URL (String) **Optional** - If specified, only accept requests of the repo with the specified URL.
2) Target Branch (String) **Optional** - Target Branch name or name [minimatch pattern](https://github.com/isaacs/minimatch#readme). If specified, only accept requests of pull requests to the specified branch.
3) Source Branch (String) **Optional** - Source Branch name or name [minimatch pattern](https://github.com/isaacs/minimatch#readme). If specified, only accept requests of pull requests from the specified branch.

### 2) VSTS Push Webhook
This methos is envoked when a new push is called.  
This Webhooks URL is: *\<Kaholo-URL\>/azuregit/webhook/push* .

#### Method Parameters:
1) Repository URL (String) **Optional** - If specified, only accept requests of the repo with the specified URL.
2) Push Branch (String) **Optional** - Branch name or name [minimatch pattern](https://github.com/isaacs/minimatch#readme). If specified, only accept requests of push to the specified branch.
