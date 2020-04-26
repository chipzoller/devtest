---
title: "Automate Log Insight agent installation from vRA"
date: 2017-08-25
description: "Custom software component for vRealize Automation that automates the installation of the vRealize Log Insight agent."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-08/automate-log-insight-agent-installation-from-vra/featured.jpg"
categories:
  - Technology
tags:
  - log insight
  - vra
  - vrealize
---

Hi, all, short blog post today to inform you of some new community content. Logging is a pretty important thing these days (well, almost all days), and being able to implement that into your CMP is equally as important. VMware's Log Insight solution is a fantastic platform for aggregating, analyzing, and searching for logs, which offers the best integration with other VMware products from any others on the market. Log Insight can consume logs from a variety of sources over several protocols. It also has an agent that can be installed in Windows and Linux and, with server-side configurations, is able to send file-based logs back to the Log Insight system/cluster. Well, today I bring to the community two new blueprints that automate the installation of this agent into workloads deployed from vRealize Automation. Simply import the .zip file into vRA using the API or the CloudClient, and drag-and-drop onto a blueprint. The nice thing about both of these blueprints is the agent is streamed directly from the Log Insight system–no need to pre-stage the agent package on a file server. Check the links on VMware Code if you're interested in checking these out:

## [Log Insight Agent for Linux](https://code.vmware.com/samples?id=2798)

## [Log Insight Agent for Windows](https://code.vmware.com/samples?id=2799)