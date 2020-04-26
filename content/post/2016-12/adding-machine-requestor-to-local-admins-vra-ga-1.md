---
title: "Adding machine requestor to local administrators group in vRA 7"
date: 2016-12-05
description: "Adding the machine requestor in vRealize Automation to the local administrators group on Windows."
# author: "John Doe"
draft: false
toc: false
menu: main
featureImage: "/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vrealize
---

*This article is the first in a series of three which explore the vRealize Automation guest agent in depth. For the others, please see these links.*

## Part 1: [Adding machine requestor to local administrators group in vRA 7](/post/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/)

## Part 2: [Running in-guest scripts on Windows VMs in vRA 7](/post/2016-12/running-in-guest-scripts-vra-ga-2)

## Part 3: [Running Bash commands in the Linux guest agent in vRA 7](/post/2016-12/running-bash-in-linux-guest-agent-vra-ga-3)

---
\
When I first started using vRA (it was still called vCAC at that point), there was this concept of a “guest agent” that got installed in a VM template. It allowed you to do some types of customization when that template got deployed as a VM, but what it did, how it worked, and how to use it was kind of cloudy. The more I read and spoke with other users, the more I realized they were in the same boat. I understood why after looking at the documentation. Installing it wasn’t straightforward, controlling it came via these things called “custom properties” that had cryptic names, and using it required that you fish for the right set of properties, create them correctly, and apply them correctly. While some of that still holds true today, much has changed. In this three-part blog series, I hope to dispel some of the myths and dissipate those mental clouds some no doubt still have by illustrating how to use the guest agent through demonstration of three of the most common use cases. The first will be an introduction to the agent as well as how to make the vRA requestor a local administrator; the second will show how to run commands and scripts on Windows templates; and the third will do the same but on Linux. Strap in, because it's time for a ride!

In the first and second articles, we’ll be working with the guest agent on Windows. In the third, we’ll switch over to Linux. To start with, have a fresh Windows Server 2012 R2 template. Next, we’ll need to install the guest agent inside of this. The guest agent is a software application that comes bundled with vRA. It is an optional component, but a necessary one if you want to perform one of several post-provisioning customization actions. Things like mounting and formatting disks, applying custom network settings, running scripts, or changing local group memberships are all things that necessitate the guest agent. Basically, anything that requires actions be performed inside the deployed machine must be accomplished through the guest agent. Obtaining the guest agent is simple. You navigate to https://\<vRAFQDN\>:5480/i and download the appropriate Windows guest agent packages to your template. Starting in vRA 7.1, these have been moved to https://\<vRAFQDN\>/software/index.html

![Guest agent packages are located under Provisioning Utilities](/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/image1.png)

However, a better way to get the guest agent installed and configured, is to use [Gary Coburn’s awesome PowerShell script](https://developercenter.vmware.com/samples?id=1136), which also installs the software bootstrap (aka, Application Services/Application Director) agent. The interactive script asks you several questions, and at the end you have the guest agent, application services agent, and Java. By the way, you must point the guest agent to your vRA Manager service in case that wasn’t clear (not the Web server). Now, be aware that when you check the list of Windows services, the guest agent will not be listed but the software agent will. This is normal and things will work as expected. The guest agent only gets registered when there is work for it to do, then unregistered when that work is done.

Now that we have that done, we can shut down this VM and convert it to a template. Head into vRA and create a blueprint based on this template. Go to the machine component and let’s start creating some custom properties.

![Basic vSphere machine object](/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/image2.png)

![Custom properties tab on machine object](/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/image3.png)

We need to create a couple of basic custom properties that tell vRA it needs to use the guest agent, since that’s what will drive these custom commands and scripts we run. We also want to create a custom property that tells the guest agent to wait to start any of its work only until **after** the general sysprep work has finished. Create the following custom properties and set their values to “True” (without double quotes).

```sh
VirtualMachine.Admin.UseGuestAgent
VirtualMachine.Customize.WaitComplete
```

Normally, when a requestor in vRealize Automation requests a machine (assuming Windows here), that user does not get added as a local administrator on the box, nor does that user make it into the Remote Desktop Users group (allowing them to RDP into the box). There are other ways to get that user the permissions he/she needs on their deployed machines, but that requires group policy changes which requires Active Directory changes, etc. I’m willing to bet this is something many of you want or need, right? Wouldn’t it be nice if, you know, vRA could do this for you? Even though this ability does (apparently, I guess) work, it doesn’t **seem** to work in the way you might want or expect. Let’s look into this vexatious issue.

There is a custom property called `VirtualMachine.Admin.AddOwnerToAdmins` which has been documented in the custom property reference guide since version 6.0. However, there appears to be a contradiction of terms found in that guide starting in the reference document beginning with version [6.1](http://pubs.vmware.com/vCAC-61/topic/com.vmware.ICbase/PDF/vcloud-automation-center-61-custom-property-reference.pdf) and continues [to this day](http://pubs.vmware.com/vrealize-automation-71/topic/com.vmware.ICbase/PDF/vrealize-automation-71-custom-properties.pdf). Speaking of the 7.1 document here, there are four occurrences of this property name, but only three of them fall in groupings of custom properties (pp. 19, 42, and 67). In the first two, the description given is:

> Set to True (default) to add the machine’s owner, as specified by the VirtualMachine.Admin.Owner property, to the local administrators group on the machine.

But in the last description of the property, where they are listed alphabetically, an additional sentence is appended to that description:

> This property is not available for provisioning by cloning.

What’s interesting is that this property with description (minus the last bit) is included in a category of custom properties that apply to clone workflows(!). So which is it, VMware? Does this or does this property not apply to clone workflows? In my testing with vRA 7.0.1 on a Windows Server 2012 R2 linked clone template, it appears to not work.

Now, there is a [KB article](https://kb.vmware.com/kb/2081190) out there which shows how you could get this to work by creating a custom script in your template and calling it via another set of custom properties. That should work, but it’s cumbersome and not elegant and inefficient, plus it has nothing to do with the property designed to handle the issue at hand. I’d prefer to “fix” the advertised functionality so it works as documented without the need to complicate things.

The problem why this functionality doesn’t work as stated (whichever section in the manual is correct) isn’t entirely clear to me, but what is clear is that the work item being run by the guest agent doesn’t include any script or logic to add the user to the local administrators group. This is in spite of the fact that the needed custom properties do get passed down into the guest. You can verify this is the case by opening up the workitem.xml file located at C:\VRMGuestAgent\site and seeing all the properties that get applied to the deployed machine.

![Custom property payload](/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/image4.png)

As you can see here, these are all the properties that begin with the value “virtualmachine.admin,” and we can clearly see the property in question is present. We also see the owner value (requestor) and that we should invoke the guest agent.

When inspecting the guest agent log located at C:\VRMGuestAgent\GuestAgent.txt, we can see the items that are executed by the guest agent. While much of the log includes requests for work by the agent with none returned, eventually there will be some in the form of customization workflows such as what you see here.

```log
2016-10-28 22:05:38 Application: [Information] Requesting work for agent ID e7480f42-f942-2f44-4af6-7cd4811ec6ff.
2016-10-28 22:05:38 Application: [Information] Fetching a work item ...
2016-10-28 22:05:38 Application: [Information] Fetched work item id=bc09a607-502a-4970-9ed3-bd7b35fd31ea
2016-10-28 22:05:38 Application: [Information] WorkItem: task=CustomizeOS, id=bc09a607-502a-4970-9ed3-bd7b35fd31ea
2016-10-28 22:05:38 Application: [Information] _number_of_instances -> 1
```

In the case of clone workflows, a “CustomizeOS” stage is being called. Each of these stages corresponds to a set of script files and a batch file which calls them as needed. All of this is found in the site directory at C:\VRMGuestAgent\site in folders named for each stage. If we go and look in the CustomizeOS directory, we see a .BAT file with the following contents.

```sh
cscript diskpart_unassign.js
echo wscript.sleep 10000 > wait.vbs
wscript.exe wait.vbs
cscript diskpart_prep.js
wscript.exe wait.vbs
cscript diskpart_exec.js
wscript.exe wait.vbs
cscript formatjs.js
```

It’s pretty simple as you can observe. It’s using cscript to call a bunch of separate JavaScript files. These files are located in this same directory, so you can go see for yourself what is being done. In this case, however, the one we really need to be called, entitled “adduser.js,” isn’t listed. Before proceeding, however, a disclaimer is probably in order.

**DISCLAIMER:  THIS IS ALMOST CERTAINLY NOT SUPPORTED BY VMWARE. USE AT YOUR OWN RISK.**

Alright, now that you’re scared, let me put you at ease by saying this is an easy fix, shouldn’t break anything, and is simple to roll back if you don’t want or like it. Onward.

In order to fix this, we need to make a change to a file in our Windows template. We only need to add two simple lines to a single file to activate this functionality. Navigate to C:\VRMGuestAgent\site\CustomizeOS and edit “10_customizeos.bat”. Before doing so, it’s a good idea to back up this file to the same directory naming it something like “10_customizeos.backup.” You saw the contents of this file above, so since we need “adduser.js” to run, let’s just append it to the bottom of the file. To keep in step and allow an amount of sleep established previously, add another line of `wscript.exe wait.vbs`. And, as you probably have figured by now, we simply need to add a line to invoke “adduser.js”. Your fully-edited .BAT file should look like this:

```sh {hl_lines=["9-10"]}
cscript diskpart_unassign.js
echo wscript.sleep 10000 > wait.vbs
wscript.exe wait.vbs
cscript diskpart_prep.js
wscript.exe wait.vbs
cscript diskpart_exec.js
wscript.exe wait.vbs
cscript formatjs.js
wscript.exe wait.vbs
cscript adduser.js
```

This is safe to add because, if you look at the adduser.js file, it essentially performs no action unless the relevant custom properties are found. The code block enabling this is right at the beginning:

```js
// stuff the owner into Administrators and Remote Desktop Users
// groups if the custom properties are there
if (bag.exists("virtualmachine.admin.addownertoadmins")) {
  if (bag.get("virtualmachine.admin.addownertoadmins").toLowerCase() == "true") {
    objGroup = GetObject("WinNT://" + comp + "/Administrators,group");
    objGroup.Add("WinNT://" + owner + ",user");
  }
}

if (bag.exists("virtualmachine.admin.allowlogin")) {
  if (bag.get("virtualmachine.admin.allowlogin").toLowerCase() == "true") {
    objGroup = GetObject("WinNT://" + comp + "/Remote Desktop Users,group");
    objGroup.Add("WinNT://" + owner + ",user");
  }
}
```

Note that the second “if” statement operates on a second custom property which you can use to add the machine owner to the Remote Desktop Users group. That property is called `VirtualMachine.Admin.AllowLogin` and must also be set somewhere on the machine in question.

Once you’ve edited that .BAT file to add the necessary JavaScript file, you can shutdown your template and either snapshot it (if you’re using a linked clone workflow) or just go straight into your catalog and deploy.

![Test machine request form](/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/image5.png)

Above, I added those two custom properties (the second and third fields you see here) to the machine and made it so they show in the request and are overrideable. This is especially useful if you want to toggle them easily between a True and False statement before deployment in the request form to ensure the behavior is working as expected.

Deploy the machine, let the customization finish, and login to your box to make sure your owner is a member of the local administrators group.

![User added to local admins group](/images/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/image6.png)

Bam! User ZOLLER\dennisend, which is just a regular old domain user, and, more importantly the requestor of this VM, has just been made a local administrator. Now you can just attach this custom property wherever you want (along with `VirtualMachine.Admin.UseGuestAgent`, the property to use the guest agent) and have your users become local admins.

In the second part of the series, we’ll take a look at another important functionality provided by the guest agent:  running scripts inside the guest.
