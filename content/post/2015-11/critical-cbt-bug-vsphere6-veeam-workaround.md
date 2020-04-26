---
title: "Critical CBT Bug in vSphere 6 and Veeam workaround"
date: 2015-11-16
description: "A critical bug in the changed block tracking mechanism in vSphere 6 sees workaround from Veeam."
# author: "John Doe"
draft: false
toc: false
menu: main
# featureImage: "/images/path/file.jpg"
categories:
  - Technology
tags:
  - vsphere
  - veeam
---

There was recently (12 November 2015) another critical backup-related bug published affecting ESXi 6.x and CBT-based backups. Any backup product that leverages VADP (snapshot-based backup processing) is affected by this issue. For customers using Veeam, here is a workaround if it is not possible to downgrade to ESXi 5.5.

Edit each job that processes VMs on hosts that are at version 6 or higher, go to Storage, then click on the Advanced button. Click on the vSphere Tab and disable changed block tracking.

![Edit Veeam backup job and click the Advanced button](/images/2015-11/critical-cbt-bug-vsphere6-veeam-workaround/image1.png)

![Uncheck the box to use CBT](/images/2015-11/critical-cbt-bug-vsphere6-veeam-workaround/image2.png)

The next time the job runs, it will ignore any CBT data and re-scan the entire disk. Note that this will increase job runtime as a block-for-block comparison will be kicked off on every virtual disk assigned to those VMs. This is necessary even if taking full backups with the job as CBT is also leveraged when doing so to identify zero-length blocks.

Customers should monitor [KB 2136854](http://kb.vmware.com/kb/2136854) for a resolution, which hopefully will be forthcoming very soon.
