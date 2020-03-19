# kaholo-plugin-vsts-trigger
VSTS Trigger repo

The VSTS trigger is a webhook trigger for ***Azure DevOps git*** repository. 
The trigger currently have two methods:
1) Trigger a pipeline from a new Pull Request.
2) Trigger a pipeline from a new Push.

## Trigger's methods:

### 1) VSTS Pull Request Webhook
This method envoked when a new Pull request is called. The method name is `prWebhook`.

#### Method Parameters:
1) REPO_URL
2) TO_BRANCH
3) FROM_BRANCH

### 2) VSTS Push Webhook
This methos is envoked when a new push is called. The method name is `pushWebhook`

#### Method Parameters:
1) REPO_URL
2) PUSH_BRANCH

