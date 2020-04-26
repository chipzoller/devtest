---
title: "Running Bash commands in the Linux guest agent in vRA 7"
date: 2016-12-19
description: "Customized script to enable running bash commands in Linux via the vRealize Automation 7 guest agent."
# author: "John Doe"
draft: false
toc: false
menu: main
featureImage: "/images/2016-12/running-bash-in-linux-guest-agent-vra-ga-3/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vrealize
---


*This article is the third in a series of three which explore the vRealize Automation guest agent in depth. For the others, please see these links.*

## Part 1: [Adding machine requestor to local administrators group in vRA 7](/post/2016-12/adding-machine-requestor-to-local-admins-vra-ga-1/)

## Part 2: [Running in-guest scripts on Windows VMs in vRA 7](/post/2016-12/running-in-guest-scripts-vra-ga-2)

## Part 3: [Running Bash commands in the Linux guest agent in vRA 7](/post/2016-12/running-bash-in-linux-guest-agent-vra-ga-3)

---
\
Welcome back! Taking the first and second part of my three-part series on exploring the vRA guest agent as a starting point, in this article we’ll look at the Linux guest agent and how to use it to run commands and scripts like we showed on Windows in part two. Specifically of interest here, I’m calling out the word “commands”.  In Linux, unlike on Windows, we are restricted to only running scripts. We can’t directly execute the equivalent of a “net use” command like in the previous post. We’d have to call a script stored locally that has such a command written inside. That’s all well and good, but it takes us back to having to potentially manage and maintain an artifact in our template, and I want to avoid that if at all possible. Today, we’ll look at this Linux agent more in depth and also offer a solution on how we can run arbitrary commands in addition to scripts. We’ll build on the previous two posts, so for basics on custom properties and property groups, see parts one and two.

Installing the Linux guest agent is just as simple (if not simpler) than installing the Windows agent. At least VMware were kind enough to provide a single script that automates the whole process of getting the software agent, guest agent, and necessary dependencies all installed for you. In this article, I’ll use a CentOS 7 template to illustrate. First, go to https://\<vraFQDN\>:5480/i and click on “VM Templates Preparation for Software Provisioning.” Starting in vRA 7.1, these have been moved to https://\<vRAFQDN\>/software/index.html.

![Scripts and other packages can be found under Provisioning Utilities](/images/2016-12/running-bash-in-linux-guest-agent-vra-ga-3/image1.png)

From there, download `prepare_vra_template.sh` and copy it over to your template. Execute the script and follow the simple on-screen directions. Remember that we need to put our manager server in there when prompted, not the web server. Once complete, we need to doctor one of the files that makes our nifty change possible. Why is this necessary? As I mentioned above, the Linux guest agent can only execute scripts. Anything that is not a script it will just fail out on. It’s just a hunch on my part, because I don’t know why DynamicOps/VMware decided to do this, but I believe the script is intentionally crippled to disallow arbitrary command execution. There does not appear to be a technical reason why shell commands cannot be executed other than the original code prevents it. So to issue my same warning as I did in part one:

**DISCLAIMER:  THIS IS ALMOST CERTAINLY NOT SUPPORTED BY VMWARE. USE AT YOUR OWN RISK.**

Navigate to /usr/share/gugent/site/InstallSoftware/ and replace the file `10_InstallSoftware.sh` with one of the ones provided for your version of vRA. Before doing so, it’s always a good practice to backup the original. Copy it to a backup file in the same directory. Make sure that the execute bit is disabled on it or else the agent may try to use it even with the name being different. Let’s see the changes we made in the new file.

Even though a chunk is removed and another changed, this is the meat of it all:

```bash
EscapedString=$(python getprop.py Vrm.Software.Command)
PropertyValue=`echo "$EscapedString" | sed -e 's~\&amp;~\&~g' -e 's~\&lt;~<~g'  -e  's~\&gt;~>~g' -e 's~\&gt;~>~g' -e 's~\&quot;~\"~g' -e "s~\&apos;~\'~g"`

...

if [ "$PropertyValue" != "False" ];then
    sleep 10
        if [ -x "$PropertyValue" ]; then
            . $PropertyValue
        else
            eval $PropertyValue
        fi
```

I cut out a good chunk of code, and you can see for yourself in the file, but we’re doing two things.

1. We are telling it to see if the work item is an executable file. If it is, it’ll attempt to run it, but if it’s not it assumes it’s a command and attempts to execute that.

2. We are replacing escaped HTML characters with their ASCII originals so we can chain Bash commands together that have characters like > and &. If we didn’t do this, we’d attempt to run a Bash command like `echo “something” &gt /tmp/myfile` which obviously wouldn’t fly. Using the `sed` utility, we are replacing those escape characters with the originals.

Once that file is replaced, we can shutdown this Linux VM and convert it to a template. Go through the usual process of creating a blueprint out of it, and let’s use part two’s illustrated functionality of creating property groups and using those to store our software scripts or commands. To illustrate this new functionality, how about we create a property group that performs the same function as the first one we created in part two? In other words, let’s create a Linux repo mount property group that doesn’t require the use of a script to do it for us. Here are the properties I’m going to use:

![Custom properties in use](/images/2016-12/running-bash-in-linux-guest-agent-vra-ga-3/image2.png)

Just like with Windows, my `VirtualMachine.Software0.ScriptPath` will have my mount command. In this case, I’ll use the following:

```sh
mkdir /repo && yum -y install cifs-utils && mount -t cifs -o username={Mount.Username},password=[Mount.Password] //{Mount.Path} /repo
```

A directory at /repo will be created, followed by a mount command that mounts our repo by taking the custom properties `Mount.Username`, `Mount.Password`, and `Mount.Path` and replacing them at runtime. You might have observed that we’re doing replacement of an encrypted property again. If you’re in vRA 7.1 or 7.2, this works just like it did in the Windows agent; if you’re still on vRA 7.0, this is not an option. If you are using vRA 7.x, we could certainly store a password as an unencrypted property and have the guest agent replace it, except we’d need to scrub a couple files to make sure it doesn’t linger. If that interests you, you could perform a `shred -n 100 -z -u` of /usr/share/gugent/GuestAgent.log as well as /usr/share/gugent/site/workitem.xml. That should obliterate all traces of your password. To automate the process, you could even add this to the file `10_noop.sh` located at /usr/share/gugent/site/Finalize as this is what gets called after the guest agent has completed all of its work.

Naming is another thing. Since we have property groups that belong to either Windows or Linux, we can have two sequences of numbers to maintain. Naming is key here to not only know where you left off in the sequence so you don’t repeat the `Virtualmachine.SoftwareN.` properties, but also so you have the ability to sort the name column and find what you need easier. You may want to do something like this for your property group naming standard:

```sh
Scripts – [OS] – [SoftwareN] – [Name]
```

The portions in brackets are dependent upon your OS (Windows or Linux), the software sequence number (or you could just use NN instead of SoftwareN), and finally whatever you want to call this.

![Example naming schema](/images/2016-12/running-bash-in-linux-guest-agent-vra-ga-3/image3.png)

Go ahead and attach whatever name you give this Linux repo mount command to your blueprint, either at the blueprint level, or at the machine level, and fire off a request. Once done, you should be able to access your share at /repo, or whatever Bash command you tried to run. Check the agent log at /usr/share/gugent/GuestAgent.log and search for “vrm.software.command” to ensure it ran what you expected. To make sure it can still run .sh scripts, try creating another property group and giving it the absolute path to a script on your template. You should find it runs both at this point. As a last step, you may wish to create a simple bash command that unmounts that repo as I have done in the screenshot above. A simple `umount /repo` should do the trick and can be created as yet another property group then attached to your blueprint.

I’d like to give special thanks to Dell (now NTT Data) developer extraordinaire, [Josh McCartt](https://www.linkedin.com/in/josh-mccartt-1b7bab72), for his help in developing the cool replacement script that makes running Bash commands possible.  Thank you, Josh!

Let’s do a brief recap of the series to show what we covered:

1. We introduced the guest agent in part one and showed custom properties that enable it.

2. Also in part one, we provided a small workaround that makes it possible to add both the machine owner (requestor) to the local administrators group and the Remote Desktop Users group.

3. In part two, we extended these concepts by showing how you can run not only scripts but cmd and PowerShell commands on a Windows VM.

4. You now have a system of organization for your scripts/commands by way of property groups, plus an example naming system which makes it easy to find, manage, and maintain those scripts. Oh, don’t forget to show the “Name” property in requests so you know exactly what will get executed on a given blueprint.

5. In part three, we built on the prior two articles by showing how this works on Linux. Additionally, we provided a replacement file for the guest agent which now makes it possible to run not only .sh scripts, but any shell command on Linux just as was possible on Windows.

I hope you’ve found this three-part series to be valuable and maybe even learned a thing or two. I know I have. Although the guest agent has limitations and may not be the best choice for everyone, it’s there, it works, and with a little organization and careful planning can make for a decent system for running various operations inside your deployed VMs through vRealize Automation.

## [**SCRIPT DOWNLOAD**](https://github.com/chipzoller/BlogScripts/tree/master/vRAGuestAgentSeries)