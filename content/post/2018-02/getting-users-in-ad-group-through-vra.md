---
title: "Getting users in an AD Group through vRA"
date: 2018-02-24
description: "How to pull in users in Active Directory to vRealize Automation"
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-02/getting-users-in-ad-group-through-vra/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vro
  - vrealize
---

Have you ever needed or wanted to dynamically get the users within an Active Directory group through vRA? The process I hoped would already exist but, unfortunately as I found out, the existing vRO Active Directory plug-in does not contain a pre-built workflow or action to handle this. As I typically do, I find my own way, but my trials and tribulations can easily be to your benefit as you’ll see. The use case for getting users within a group can vary. In my case, there is a customer for whom I’m building a CMP and they wish to dynamically pull in all the users within one specific AD group to which they can assign provisioned machines for metadata purposes. This metadata would then be sent in a custom notification to a recipient which tells them of the new machine(s) that has/have been built and this user chosen at request time. So this group membership needs to be displayed in a request form in a drop-down and the requestor able to pick a member. With a little bit of vRO work and a cool trick in vRA I learned, this is pretty easy and others may find it useful.

In my test environment here, I’m on vRA 7.3 with an external vRO 7.3. None of that should matter as all these steps should be applicable to earlier versions as well. That said, I updated my vRO Active Directory plug-in to the latest available [here](https://communities.vmware.com/docs/DOC-25138). The newest version is v3.0.7 as of this writing. Once the plug-in is updated, run the “Add an Active Directory server” workflow found in Library -> Microsoft -> Active Directory -> Configuration.

![Add an Active Directory server vRO workflow, Connection](/images/2018-02/getting-users-in-ad-group-through-vra/image1.png)

Step 1a is fairly self-explanatory. Host in my case is just a single AD server. Base is the root object of your AD in DN format.

![Add an Active Directory server vRO workflow, Authentication](/images/2018-02/getting-users-in-ad-group-through-vra/image2.png)

Since this is for use in vRA, we want to use a shared session with a service account and avoid per-user sessions.

![Add an Active Directory server vRO workflow, Alternative hosts](/images/2018-02/getting-users-in-ad-group-through-vra/image3.png)

What’s nice in step 1c is you can provide multiple AD servers that can be attempted. The algorithms are Single Server, Round Robin, or Fail-Over.

![Add an Active Directory server vRO workflow, Options](/images/2018-02/getting-users-in-ad-group-through-vra/image4.png)

And, finally, add a timeout value to wait before failing. I chose 5 seconds but, depending on your AD size, this may need to be longer.

Once the workflow successfully completes, verify you have it in your inventory explorer.

![vRO inventory explorer](/images/2018-02/getting-users-in-ad-group-through-vra/image5.png)

The tree here shows it is indeed working.

Once you’re good there, import the action I’ve pre-built. The JavaScript required in order for it to function is fairly rudimentary:

```js
userArray = new Array();
var usersInGroup = userGroup.userMembers
for each (user in usersInGroup) {
  //System.log(user.Name)
  userArray.push(user.Name);
  }
//System.log(userArray);
return userArray;
```

I’ve commented out a couple lines that allow logging the user names to System just for development and troubleshooting purposes to ensure the results are returned and in the correct format.

With this action imported, flip over to vRA. Go create a new Custom Property definition. In the one below, I’m calling it CZAD.Users and choosing to get external values from the new action.

![Custom property definition](/images/2018-02/getting-users-in-ad-group-through-vra/image6.png)

Click on the userGroup input parameter and edit it. The value is going to be the identifier in vRO’s AD inventory that corresponds to the user group which we want to list the users.

```sh
#_v2_#,#UserGroup#,#04452c1c-2a57-4bbb-bf1d-ada37c2edea0#,#CN=Middleware,OU=vCAC,DC=zoller,DC=com#
```

Flip back over to vRO and browse in your AD inventory tree to find the group whose members you wish to list. Click the user group in the tree and check the General tab.

![AD group details in vRO inventory explorer](/images/2018-02/getting-users-in-ad-group-through-vra/image7.png)

You see VSO ID as shown above? This is the value we’ll copy and paste into the input parameter definition back in vRA. This is a unique ID which essentially is an API “shortcut” to reference this one specific group and no other. With this, we can avoid having to hardcode the name of this group into our action or pull it from some other place in vRO. Since userGroup is the input object, we can simply supply this value with vRA and be done with it—so one place to go if you wish to change that group later.

With this VSO ID copied and pasted into the input parameter, save the custom property. Let’s add it to a blueprint and see if it works.

![vRA blueprint properties](/images/2018-02/getting-users-in-ad-group-through-vra/image8.png)

Go to the request form now.

![vRA request form with `CZAD.Users` populating](/images/2018-02/getting-users-in-ad-group-through-vra/image9.png)

And boom, there are the users in that AD group! Don’t believe me? Go check the membership for yourself in AD to compare.

![AD group showing membership](/images/2018-02/getting-users-in-ad-group-through-vra/image10.png)

And there you have it! With this simple action, you can pick a user from an AD user group and consume it as a string-based custom property anywhere you like in vRA.

Very simple little action that does a simple thing, but it solves a small use case and others may find it useful as well.

[Download getADGroupMembership from VMware {code}](https://code.vmware.com/samples?id=3763)
