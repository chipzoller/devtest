---
title: "Synology DiskStation:  The Magical Crash"
date: 2016-07-15
description: "A magical crash of a Synology Diskstation in the lab."
# author: "John Doe"
draft: false
toc: false
menu: main
# featureImage: "/images/path/file.jpg"
categories:
  - Technology
tags:
  - homelab
---

I’m inside, at my desk on a Sunday morning having just had some coffee and not in the best of spirits despite looking out the window at a beautifully sunny day on a well-coiffed lawn. I look to my left and patiently wait for a vertical row of four green, blinking lights to calm themselves. It’s definitely a moment of anxiety for me, because at this moment, I am having to rebuild and start anew with my 4-bay Synology DS412+, the NAS I’ve been using in my home lab for the past few years. What led up to this now unfortunate situation that is causing me to have heart palpitations? Read on…

I bought this NAS several years ago to serve as the cornerstone of my home VMware lab. I have an extensive set of equipment at home that I use to test different products and model customer scenarios for my own education, enjoyment, and to examine problems facing customers in hopes of finding a solution once I put myself in their situation. I have run between 10-60 VMs on this NAS and it has, despite not being the best performer, been very reliable and trustworthy. I expanded its use to include my music collection, movies from my home library, Veeam backups, and sundry other purposes. Outfitted with four 2 TB Western Digital Red drives (build for use in a NAS) that spin at a tepid 5,400 RPM, it isn’t a rocket ship, but coupled with PernixData in my Dell R610 servers, it was actually quite responsive and, at times, speedy. All of that seemed to come to a grinding halt about a week after I moved states. This NAS, which had been in service for almost a year continuously and a picture of health (at least, as reported by Synology’s DSM software which performs basic and extended S.M.A.R.T. checks monthly, plus data scrubbing) suddenly and without warning went from perfectly functional on day 300, to, after having been powered off and in a box for seven days and powered on in my new house, deciding that the entire volume and backing disk group was crashed. With four drives in a Synology Hybrid RAID (SHR) configuration with a single drive of fault tolerance (basically, RAID-5), upon power up it was now telling me that disk three was “crashed” and disk two was mysteriously gone from the disk group. In inspecting that disk, it showed as simply “not initialized”. Um, what? Disk two, miraculously and mysteriously just gone from the group. How is that even possible? I checked disk three and prior to it having only one bad sector (all other drives had zero), it now showed as having found two additional bad sectors. That was apparently enough, coupled with the exodus of disk two, to call this volume crashed. I was dumbfounded, to say the least, and extremely agitated and upset to say the most. I had treated and attended this NAS with the utmost care, purchased good, solid drives that were on the hardware compatibility list for this model, and run preventative health checks and maintenance like clockwork. I kept the unit safe, cool, and free of dust during all those years, and always had it connected to a pure sine wave UPS system. There were only maybe two crashes where the UPS couldn’t sustain power long enough for me to shut down the system gracefully, yet I never had any issues up until now of powering it on and getting back to life. But this time, despite doing everything right, shutting it down in a graceful manner, packing it gingerly in its original box, moving it to my new home (it rode shotgun with me the whole drive), and powering it back up just a week later, it appeared to be completely hosed.

After some initial troubleshooting, which included rebooting it several more times and reseating disk two, I had to contact Synology for support. They offer only email support for this model (even though it is an advanced home/SMB model) despite your warranty period and absolutely will not help you over the phone no matter how serious. So I did what I could do—open an email support case. I got a decently quick response given the severity, and proceeded to answer questions consistent with a tier 1 support person. That usually entailed, as I’m sure others have experienced themselves, explaining the basics four times of how this was set up, configured, and what occurred, and then allowing remote access. “Ok, great,” I thought, “they’re surely going to see this is some sort of weird bug and re-add disk two to the group so at least it’ll be in a degraded state.” Well, to provide the Reader’s Digest version of this story, they weren’t successful in helping at all, didn’t fully understand what I had told them, and essentially said after two weeks of back-and-fourth emails that I needed to copy the data off (which I had already done since it was in a read-only state), delete the disk group, and recreate it. After numerous inquisitions on my part as to how something like this could happen after I had done everything right, their answer was essentially, “I dunno.” My response to this epiphany was such:

> “I would like to escalate this case to a higher tier, please. It does not seem like an acceptable answer to me to not be able to explain, one way or another, why a Synology NAS is working perfectly for an extended period of time, and after powering it back on 7 days later shows it to be crashed with one disk mysteriously gone from the disk group. I am an IT professional and an "I dunno" response from a storage vendor who's device was in a similar situation is *never* acceptable. I realize this is essentially "free" support, but I need a better answer than what I've been given to this point.”

The escalation (if there was one) was also of no help; not only could it not be repaired, but they couldn’t even tell me why this happened, how it could have theoretically happened, or what I could have done to avoid it.
Fast forward to today and back to this bucolic scene playing out on the lawn in front, I find myself in a depressed and melancholic state having just killed years’ worth of work, waiting for a disk check to complete so I can move things back and recreate what I had done. Moral of the story? …I really don’t know if there is one. Maybe to never trust and put your faith in any storage vendor, product, or support personnel? Maybe to stop using Synology devices? Maybe to keep any data you care about in triplicate? I’m not sure, honestly. While there was no data loss—so far as I can tell right now, anyway—there was a huge bunch of time and trust lost by this. If something like this can happen to me despite being so careful and cautious, it can happen to anyone at any time. Whatever lessons I learn from this in the future, the one that sticks out in my mind will be that the image of Synology devices has certainly gone down several pegs in my mind and that I’m not sure I can as fervently recommend them to others as I have done in the past.