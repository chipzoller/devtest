---
title: "4 Free Community Veeam Tools and Utilities"
date: 2017-06-21
description: "Free Veeam tools and utilities available to the community."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-06/four-free-veeam-tools/featured.jpg"
categories:
  - Technology
tags:
  - veeam
  - vra
  - vrealize
  - powershell
  - vsphere
---

I wrote last about attending VeeamON 2017 in New Orleans and you can view that here. As I was deep in various sessions or talking with peers and Veeam folks, several things stuck out in my mind as current gaps or “nice-to-haves” when it comes to Veeam. So after putting pen to paper, I identified four things I thought could really help other users out. I’m glad to say that all of these have been brought to fruition and have now been released to the community for all to use! Here is a rundown of these nifty utilities, what they do, and most importantly where you can download them.

## [**1. Veeam Agent for Windows Blueprint for vRealize Automation**](https://code.vmware.com/samples/2301/veeam-agent-for-windows)

With the recent release of the Veeam Agent for Windows 2.0, which importantly brings official compatibility for server operating systems and has full technical support behind it, the time was right to bring this agent into the automation fold. And when it comes to automation platforms, vRealize Automation reigns supreme. So the first on the list of utilities I have created for the community is a software blueprint that will deploy and license the Veeam Agent for Windows into a system. This could be either a vSphere virtual machine, or a machine in AWS or—as of vRA 7.3—out in Microsoft Azure. The latter two are important use cases because the Veeam Agents are the recommended way to back up instances running in those public clouds.

This software blueprint works by downloading it, importing into your vRealize Automation system, storing the Veeam Agent license and executable files on an SMB share somewhere in your estate, and adding the blueprint to an existing machine blueprint. The result is a system that gets deployed into a public or private cloud of your choice, and then gets the Agent installed and set up for you ready to begin jobs. I won’t go into full details here since I’ve already covered it on the sample over at VMware Code. Get the download link here and try it out for yourselves. Comments and suggestions are always welcome as this and the other utilities I will try and keep up-to-date as more releases come along.

## [**2. Veeam Agent for Linux Blueprint for vRealize Automation**](https://code.vmware.com/samples/2320/veeam-agent-for-linux)

Just like the Agent for Windows blueprint above, I’ve done the same thing with the Linux agent now it has reached 1.0 Update 1. The concept is the same here in that you download the blueprint, upload into vRA, and finish the other steps. Do note, however, that you must be using an Enterprise license with vRA to use this and the previous software blueprints. Another nice thing about these blueprints is they support using either a workstation or server license with them. So for cases where you might not need a server license to back up a basic file server, for example, these software blueprints will allow you to declare in a simple fashion by typing either “server” or “workstation” into the property the license you wish to use. Get the Agent for Linux blueprint here.

## [**3. vCenter High Availability backup script for Veeam**](https://github.com/VeeamHub/powershell/tree/master/vCHA-Backup)

With the introduction of High Availability for vCenter in vSphere 6.5, backup of the vCenter Server Appliance (vCSA) has become a little different. What used to be a single appliance (assuming integrated PSC) has become three in an HA setup (active node, passive node, and witness node). Because of this, we have to change how backup is done since you can’t backup and restore all three. I got this idea from attending a session with [Emad Younis](https://twitter.com/emad_younis) covering backup of the vCSA. Since VMware only supports backing up the primary node in an HA setup, and because that is a role that can bounce between one of two different VMs, we need a way to determine which holds the active role at the time the backup job runs.

I decided to create a set of pre- and post-job scripts for a Veeam Backup & Replication job that protect the vCenter High Availability system. This script is designed to run before and after your job that contains the nodes of a vCHA setup. Your job can have other VMs in it, by the way. It works by connecting to the vCenter which is in HA mode, then determining which VM holds the active role by querying the API via Powershell. It then determines which node has the passive role and configures your job to exclude it from processing. Note, your witness must already be excluded. Once the job completes, it removes this exclusion essentially “resetting” itself for the next run since that role could be assumed by the other node later if a failover occurs.

These are two Powershell scripts which are hosted out on VeeamHub, and for those not familiar with VeeamHub it’s a repository out on GitHub which hosts a lot of cool Veeam community content designed to fill a bunch of minor gaps and extend the functionality of Veeam. Great stuff there. Check the readme in the project page for more information and a step-by-step guide how to set up and use them.

## [**4. SureBackup Script for Testing vCenter Server**](https://github.com/VeeamHub/powershell/tree/master/BR-Surebackup-vCenterCheck)

**Hopefully** everyone who is using Veeam is also using SureBackup to test and validate their backups are good. I say hopefully because I know after working with lots of customers install, design, and troubleshoot their Veeam systems that most still aren’t using this feature. Absolutely, definitely use SureBackup on your systems, folks! It’s a feature you **already own** and can take the guesswork out of any future restores. SureBackup works by bringing up copies of your backed up VMs in isolated sandboxed environments. It boots those VMs up in an order designed by you, and runs tests on them to make sure they are alive and kicking. It does this by a variety of tests including a simple ping, VMtools availability, and, lastly, running scripts that can check the application running inside it.

Veeam already has a set number of profiles that can test applications such as Active Directory, DNS, web servers, etc, but one thing all virtualization administrators back up that they absolutely should test and NEED to test isn’t there…and that’s vCenter Server. This is obviously a gap and so I rectified that by developing and writing my own Powershell script that is designed to test your vCenter and give an indication of its health if restored.

Last on the list, the script, which is again out on VeeamHub, is designed to connect to your vCenter when brought up in an application group. It then tries to test several of the major components for their health by listing things like VMs, tags, and storage policies. If it is successful in listing these items, the script assumes vCenter must be in good shape. If, for whatever reason, it cannot list even one of them, it fails and indicates you should check out your vCenter because, upon restoration, some of those services might not work properly. Check the readme once again for usage instructions.

---

Well, there you have it. Four new community tools and utilities designed to help you get more value out of your Veeam systems through automation of some kind. I hope these are useful to you in some fashion, and if they are (or, frankly, if you think they’re junk), please leave some feedback on the respective project pages. My idea here was really to solve gaps that I thought existed, and I hope I have done so at least in a small way. If they can be better, let me know how. If you have other ideas on missing pieces you’d like to see for Veeam and automation, drop me a line!
