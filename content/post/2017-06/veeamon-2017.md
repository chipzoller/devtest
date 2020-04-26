---
title: "VeeamON 2017"
date: 2017-06-02
description: "Recap of the VeeamON 2017 conference."
# author: "John Doe"
draft: false
menu: main
# featureImage: "/images/path/file.jpg"
categories:
  - Technology
tags:
  - veeam
---

I had the chance to attend VeeamON this year for the first time, which took place at the convention center in New Orleans from May 16–18. This three-day event was as much about the new product announcements, which we’ll get to in a minute, as well as expert technical deep dive sessions and networking. There were around 2,500 attendees in total, including about half the technical minds at Veeam. The focus of the conference was to reinforce Veeam’s message of “availability” and how they are themselves poised to be a cloud company, not just simply a backup company. With that said, there were some major announcements of new products that will be available later this year or after.

## Veeam Backup & Replication v10

VBR is their flagship product, of course, and version 10 was just announced which really closes the gap on most of the feature requests heard from customers. It is expected sometime in Q4 of 2017. The main features are the following:

* Native Agent Support. Although agents for Windows and Linux currently exist (with support, which was a huge request), version 10 will see them integrated directly into the backup console, meaning they can be deployed and managed centrally.
* NAS Support. Finally the ability to protect NAS shares will come to the product in the form of SMB and NFS protocol support. No NDMP for this first step, but we were told that would come in time.
* Cloud Archiving. Another big request was the ability to archive old data to cloud storage such as S3 or Azure, and that has been answered in the next version.
* Continuous Replication. Veeam currently replicates by using snapshots, but in v10 Veeam will have the ability to continuously replicate data thanks to the VAIO project in vSphere. This means RPOs down to seconds if you want them, but you’ll need to be using vSphere 6.5.
* Universal Storage API. VBR v10 adds not only support for more storage in the form of IBM and Infinidat, but also a new storage API that vendors can use to write their own integration with Veeam so the onus is now on them.

## Veeam Availability Orchestrator

Full details have not yet been released on this one, but as best as we can tell they are the following:

* Automated failover plan testing. Test those failover plans automatically, and not just individually.
* Automated documentation. This one sounds terrific—ability to automatically document what your DR looks like. So often, this is a requirement and is painful to generate, plus it changes rapidly.
* Integration with VBR and VeeamONE.
* Integration with DataGravity.

## Veeam Availability for AWS

The Availability for AWS solution was touted as the first cloud-native protection solution for AWS and has some neat features:

* Back up native EC2 instances. Although you can use Veeam Agents, the solution backs up EC2 instances at an image level.
* Available in AWS console.
* Partnered with N2W Cloud Protection Manager.

## Azure Private Network

Veeam has had the ability to restore directly to Microsoft Azure, but this product takes it one step further.

* VPN Gateway. An appliance on-premises and in Azure, and you can create a VPN gateway that bridges the two where those restores can be brought up.
* No re-IP of VM. When your VM comes up, it does so with the same identity as it had on-premises, meaning you just put in the mapping and it’s done.
* Already in Azure marketplace. This is something you can use right now.

## Office 365 v1.5

New features in v1.5 and v2.0 make this an easy sell to anyone using Office 365 currently.

* Multi-tenant support.
* Multi-repository support.
* REST API.
* PowerShell SDK.
* V2, support for OneDrive for Business and Sharepoint. This one here is the most often requested ability for the Office 365 availability product, and in version 2 it’ll finally be available. Same level of granular restoration will be possible for all these items, just like in VBR.

So there you have it, folks, lots of neat stuff coming that will make Veeam more useful to customers without it, and even MORE useful to those with it. We expect there will be some more “hidden” features that are announced closer to launch date, but these are the biggies.
