---
title: "PowerCLI Core on Mac or Linux made easy, with help!"
date: 2016-10-26
description: "Installing PowerCLI Core and getting help with cmdlets."
# author: "John Doe"
draft: false
toc: false
menu: main
featureImage: "/images/2016-10/powercli-core-with-help/featured.jpg"
categories:
  - Technology
tags:
  - powercli
  - powershell
---

With the [much-heralded release](https://blogs.msdn.microsoft.com/powershell/2016/08/18/powershell-on-linux-and-open-source-2/) of Microsoft’s [PowerShell](https://github.com/PowerShell/PowerShell), VMware’s [PowerCLI Core](http://blogs.vmware.com/PowerCLI/2016/10/powercli-core-fling-available.html) in [fling format](https://labs.vmware.com/flings/powercli-core) was released on October 17th.  This allows users of Mac and Linux to run PowerShell just like on Windows. While PowerCLI can be installed with instructions on the fling website, VMware also released a [Docker container](https://hub.docker.com/r/vmware/powerclicore/) with the same. Containers are all the rage right now, and we at Sovereign are all over this technology to determine how to best leverage it for our customers, so in this blog post I’m going to illustrate how to get started with both Docker and PowerCLI Core.

To begin with, let’s set some expectations straight. Docker and containers is a large and complex subject that deserves far more than a couple pages of prose can deliver. There are plenty of places to go that will help set you on the right path with containers, so I won’t attempt to usurp those efforts, but I will show how to go from zero to PowerCLI Core in a container. Let’s waste no time in getting started.

First, let’s assume we’re using a Mac here and we want to get started with PowerCLI Core. We need Docker to do that, so head over to the [Docker for Mac](https://www.docker.com/products/docker) page and download the DMG file. Do note that this version of Docker does require Mac OS X 10.10.3 or above. The previous way of running Docker on Mac entailed using the [Docker Toolbox](https://www.docker.com/products/docker-toolbox). These are essentially two different “products” and the use of Docker for Mac is preferred if you have at least 10.10.3. I won’t cover how to migrate from one to the other, as that is covered in the [Docker docs](https://docs.docker.com/docker-for-mac/docker-toolbox/). Anyhow, once you’ve installed Docker for Mac, you should get a neat new Docker icon in the upper-right-hand corner of your screen.

![Docker for Mac menu](/images/2016-10/powercli-core-with-help/image1.png)

Once you have this, you should be able to start using Docker. Again, I’m cutting out a bunch of the technical fluff in how this technology works, but you can read for yourself how this is enabled in the docs above. If Docker is installed and running, the next step is to open a terminal and see if you can get a response from your Docker daemon. Run a `docker version` and see if you get a response. You should see the following (at the time of this writing):

```sh
chipzoller$ docker version
Client:
  Version:      1.12.1
  API version:  1.24
  Go version:   go1.7.1
  Git commit:   6f9534c
  Built:        Thu Sep  8 10:31:18 2016
  OS/Arch:      darwin/amd64

Server:
  Version:      1.12.1
  API version:  1.24
  Go version:   go1.6.3
  Git commit:   23cf638
  Built:        Thu Aug 18 17:52:38 2016
  OS/Arch:      linux/amd64
```

This response indicates the version of the server and client components, which is 1.12.1 in both cases. If you get that, great, you’re ready to continue; if you don’t, stop here and backtrack because something is wrong.

So you have Docker up and running, and you can run a `docker` command to see the result. The next step is to pull the PowerCLI Core image. To do that, we issue `docker pull vmware/powerclicore`. This will download the PowerCLI Core container from the [Docker Hub](https://hub.docker.com/), basically the app store of containers.

```sh
chipzoller$ docker pull vmware/powerclicore
Using default tag: latest
latest: Pulling from vmware/powerclicore
a3ed95caeb02: Pull complete
a2d834300dc9: Pull complete
7eafb14df61e: Pull complete
601be754f541: Pull complete
5156fe387e43: Pull complete
0a9fd9017398: Pull complete
560f096f5fc1: Pull complete
e7920e161c7c: Pull complete
802da29d1e59: Pull complete
81fb3358ce40: Pull complete
c1569f996fdb: Pull complete
071830831162: Pull complete
Digest: sha256:fa5bd716a72ff4ae5bf8215d03e6a8a4620c763b7e2fb702760ca603aff02b87
Status: Downloaded newer image for vmware/powerclicore:latest
```

Now that we’ve pulled the Docker container, let’s do a `docker images` to make sure the image is local, and to see other information regarding it.

```sh
chipzoller$ docker images
REPOSITORY            TAG                 IMAGE ID            CREATED             SIZE
vmware/powerclicore   latest              5b8e0469930a        4 days ago          416.7 MB
```

Once done, we should now be able to run that container. Let’s do so with:

```sh
docker run -it --entrypoint=/usr/bin/powershell vmware/powerclicore
```

Do mind the wordwrapping here as this is all a single command. Let’s step through this command piece by piece.

1. `docker run` tells us to run an existing image in a container.  

2. The `-it` portion means we want to run it in an interactive fashion, and also attach a pseudo-TTY (i.e., terminal session) so we can pass commands into the container.

3. The `-entrypoint` parameter indicates that we want to begin this container with the following command, or, in this case, application. Entrypoint is something usually relegated to a Dockerfile (the file used to compile a Docker image), but in this case, we specify it manually at container runtime.

In any case, this command tells Docker to run the vmware/powerclicore image as a container, fire-up PowerShell, and give us a familiar CLI so we can start using it. If all that was successful, you should see this:

![PowerShell Core init screen](/images/2016-10/powercli-core-with-help/image2.png)

If you do not see this, then backtrack and figure out what went wrong. But otherwise, we should be greeted by a nice and shiny command prompt waiting to accept our every PowerCLI desires!

```sh
PS /powershell>
```

```ps1
PS /powershell> connect-viserver vcenter.zoller.com

Specify Credential
Please specify server credential
User: chip@zoller.com
Password for user chip@zoller.com: ***********

WARNING: Invalid server certificate. Use Set-PowerCLIConfiguration to set the value for the InvalidCertificateAction option to Prompt if you'd like to connect once or to add a permanent exception for
this server.
connect-viserver : 10/24/2016 23:35:49	Connect-VIServer		An error occurred while sending the request.
At line:1 char:1
+ connect-viserver vcenter.zoller.com
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [Connect-VIServer], ViError
    + FullyQualifiedErrorId : Client20_ConnectivityServiceImpl_Reconnect_Exception,VMware.VimAutomation.ViCore.Cmdlets.Commands.ConnectVIServer
```

Well, looks like it doesn’t like my self-signed certificate in the lab. Let’s override that so we can connect. Don’t remember the parameter to pass to `Connect-VIServer`? Don’t worry; I don’t either from time to time. Fortunately, that’s where the nice `Get-Help` cmdlet comes in, or as it’s known by its alias, just “help”.

```ps1
PS /powershell> help connect-viserver
Get-Command : The term 'less' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is cor
rect and try again.
At line:16 char:21
+     $moreCommand = (Get-Command -CommandType Application less | Selec ...
+                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (less:String) [Get-Command], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException,Microsoft.PowerShell.Commands.GetCommandCommand

The expression after '&' in a pipeline element produced an object that was not valid. It must result in a command name, a script block, or a CommandInfo object.
At line:23 char:21
+ } else { $input | & $moreCommand }
+                     ~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (:) [], RuntimeException
    + FullyQualifiedErrorId : BadExpression
```

Struck out again. We can’t even display the help documentation because the “less” utility isn’t available somehow. We’ll come back to this in a moment.

Let’s just fast-forward to connecting with a self-signed cert using

```sh
PS /powershell> set-powercliconfiguration -InvalidCertificateAction Ignore
```

In so doing, we should now be able to run those cmdlets we so love and adore. We’ll still need to `Connect-VIServer`, but that’s no big deal. Pass it credentials and you should be on your way. Run a simple `Get-VM` to make sure we’re good.

```ps1
PS /powershell> get-vm | ft

Name                 PowerState Num CPUs MemoryGB
----                 ---------- -------- --------
Log Insight          PoweredOn  2        7.000
Pernix               PoweredOn  1        4.000
vra7dem01            PoweredOn  2        4.000
vra7vro01            PoweredOn  2        4.000
Admiral              PoweredOn  1        3.000
puppet               PoweredOff 2        5.000
vra7man01            PoweredOn  2        4.000
```

Looks like we are, so now we can use PowerCLI on Mac just like we could on Windows. Hooray!

One problem remains. We can’t access the help pages that we really need. Yes, sure, we can pull up the on-line help, but using the help cmdlet is so much easier because it delivers knowledge within PowerShell at the time we need it. Clearly, we must have a solution. If you refer back up the page, the error message we got was due to lack of the “less” utility. Why is that? Well, images in Docker are built from a manifest known as a Dockerfile. It just so happens this file is also available to us in the container. Let’s do a “dir” command to see what’s in this location.

![Output of `dir` in a PowerShell session](/images/2016-10/powercli-core-with-help/image3.png)

Forgive the blurriness here, but I wanted to maintain the formatting to make it easier on the eyes. Ok, so here we can see the Dockerfile. Let’s do a common `cat` on it to view its contents.

```dockerfile
PS /powershell> cat ./Dockerfile
FROM ubuntu:14.04
MAINTAINER renoufa@vmware.com

ARG POWERSHELL_RELEASE=v6.0.0-alpha.10
ARG POWERSHELL_PACKAGE=powershell_6.0.0-alpha.10-1ubuntu1.14.04.1_amd64.deb
ARG POWERCLI_PACKAGE=PowerCLI.ViCore.4523941.zip
ARG POWERCLI_VDS_PACKAGE=PowerCLI.Vds.4523941.zip

RUN apt-get update && \
    apt-get install --no-install-recommends -yq \
    openssh-server \
    ca-certificates \
    curl \
    libunwind8 \
    libicu52 \
    unzip \
    wget \
    libcurl4-openssl-dev \
    git && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to /powershell
WORKDIR /powershell

# Install PowerShell package and clean up
RUN curl -SLO https://github.com/PowerShell/PowerShell/releases/download/$POWERSHELL_RELEASE/$POWERSHELL_PACKAGE \
    && dpkg -i $POWERSHELL_PACKAGE \
    && rm $POWERSHELL_PACKAGE

ADD $POWERCLI_PACKAGE /powershell/
ADD $POWERCLI_VDS_PACKAGE /powershell/

# Copy PowerCLI Profile Script to the docker image
RUN mkdir -p /root/.config/powershell/
ADD Start-PowerCLI.ps1 /root/.config/powershell/Microsoft.PowerShell_profile.ps1

# Unzip PowerCLI modules into the modules folder
RUN mkdir -p ~/.local/share/powershell/Modules
RUN unzip /powershell/$POWERCLI_PACKAGE -d ~/.local/share/powershell/Modules
RUN unzip /powershell/$POWERCLI_VDS_PACKAGE -d ~/.local/share/powershell/Modules

# Add PowerNSX Git - https://bitbucket.org/nbradford/powernsx/wiki/Home
# RUN git clone https://bitbucket.org/nbradford/powernsx.git ~/.local/share/powershell/Modules/PowerNSX

# Add Log Insight Module - https://github.com/lucdekens/LogInsight
# RUN git clone https://github.com/lucdekens/LogInsight.git ~/.local/share/powershell/Modules/LogInsight

# Add PowerVRA Module - https://github.com/jakkulabs/PowervRA
# RUN git clone https://github.com/jakkulabs/PowervRA.git /tmp/PowerVRA
# RUN mv /powershell/PowerVRA/PowervRA ~/.local/share/powershell/Modules/
```

Ok, so we have a bunch of information here.  The main things to point out are at the top. The base layer is `FROM ubuntu:14.04`, meaning the image beings with Ubuntu version 14.04. The `RUN` commands show which commands get run in composing the image. We’re installing a bunch of packages with the Ubuntu package manger, apt-get, in this case, and less isn’t among them. Let’s get less and see if that works.

```ps1
PS /powershell> apt-get install less
apt-get : The term 'apt-get' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is corr
ect and try again.
At line:1 char:1
+ apt-get install less
+ ~~~~~~~
    + CategoryInfo          : ObjectNotFound: (apt-get:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

No dice. Can we even run apt-get?

```ps1
PS /powershell> apt-get
apt-get : The term 'apt-get' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is corr
ect and try again.
At line:1 char:1
+ apt-get
+ ~~~~~~~
    + CategoryInfo          : ObjectNotFound: (apt-get:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

Nope, we can’t. What if we get a bash shell?

```sh
PS /powershell> bash
root [ /powershell ]# yum
bash: yum: command not found
root [ /powershell ]# apt-get
bash: apt-get: command not found
```

What distro is this anyway, even if we started with the Ubuntu base layer?

```sh
root [ /powershell ]# cat /etc/*-release
DISTRIB_ID="VMware Photon"
DISTRIB_RELEASE="1.0"
DISTRIB_CODENAME=Photon
DISTRIB_DESCRIPTION="VMware Photon 1.0"
NAME="VMware Photon"
VERSION="1.0"
ID=photon
VERSION_ID=1.0
PRETTY_NAME="VMware Photon/Linux"
ANSI_COLOR="1;34"
HOME_URL="https://vmware.github.io/photon/"
BUG_REPORT_URL="https://github.com/vmware/photon/issues"
VMware Photon Linux 1.0
PHOTON_BUILD_NUMBER=a6f0f63
```

Ah, so we’re based on Photon 1.0 here. In Photon, we don’t use yum or apt-get, but instead [tdnf](https://github.com/vmware/photon/wiki/Frequently-Asked-Questions#q-where-can-i-get-the-latest-version-of-a-package). Let’s see what package we need to get less in Photon.

```sh
root [ /powershell ]# tdnf whatprovides less
less-458-2.ph1.x86_64 : Text file viewer
Repo	 : photon
```

So we need the standard `less` package, not a package containing it. We can go ahead and install that with a `tdnf install -y less`. If you have Internet access, we should be able to pull down less from the public Photon repos. Let’s test that out and do a help on a familiar cmdlet to make sure the documentation shows up. To get back to a PS prompt, type `exit` to end the bash session, and press Enter to bring back the PS session we just left off.

```ps1
PS /powershell> help connect-viserver

NAME
    Connect-VIServer

SYNOPSIS
    This cmdlet establishes a connection to a vCenter Server system.


SYNTAX
    Connect-VIServer [-Server] <String[]> [-Port <Int32>] [-Protocol <String>] [-Credential <PSCredential>] [-User <String>] [-Password <String>] [-Session <String>] [-NotDefault] [-SaveCredentials] [-Al
    lLinked] [-Force] [<CommonParameters>]

    Connect-VIServer -Menu [<CommonParameters>]


DESCRIPTION
    This cmdlet establishes a connection to a vCenter Server system. The cmdlet starts a new session or re-establishes a previous session with a vCenter Server system using the specified parameters.

    When you attempt to connect to a server, the server checks for valid certificates. To set the default behavior of vSphere PowerCLI when no valid certificates are recognized, use the InvalidCertificat
    eAction parameter of the Set-PowerCLIConfiguration cmdlet. For more information about invalid certificates, run 'Get-Help about_invalid_certificates'.  

    You can have more than one connections to the same server. To disconnect from a server, you need to close all active connections to this server.
    vSphere PowerCLI supports working with multiple default servers. If you select this option, every time when you connect to a different server using Connect-VIServer, the new server connection is stor
    ed in an array variable together with the previously connected servers, unless the NotDefault parameter is set.  This variable is named $DefaultVIServers and its initial value is an empty array. When
     you run a cmdlet and the target servers cannot be determined from the specified parameters, the cmdlet runs against all servers stored in the array variable. To remove a server from the $DefaultVISe
    rvers variable, you can either use Disconnect-Server to close all active connections to the server, or modify the value of $DefaultVIServers manually.

    If you choose to work with a single default server, when you run a cmdlet and the target servers cannot be determined from the specified parameters, the cmdlet runs against the last connected server.
     This server is stored in the $defaultVIServer variable, which is updated every time you establish a new connection.

    To switch between single and multiple default servers working mode, use DefaultServerMode parameter of the Set-PowerCLIConfiguration cmdlet. Working with multiple default servers will be enabled by d
    efault in a future release.


RELATED LINKS
    Online version: http://www.vmware.com/support/developer/PowerCLI/PowerCLI63R1/html/Connect-VIServer.html
    Disconnect-VIServer

REMARKS
    To see the examples, type: "get-help Connect-VIServer -examples".
    For more information, type: "get-help Connect-VIServer -detailed".
    For technical information, type: "get-help Connect-VIServer -full".
    For online help, type: "get-help Connect-VIServer -online"
```

Grand! We now have not only

1. A working Docker installation
2. An image ready to be instantiated into a container
3. PowerCLI Core up and running, but also the ability to view Get-Help pages for cmdlets.

When we’re done with this PowerCLI session, we can simply type `exit` and our container will exit. Need that PowerCLI session again? Do a `docker ps –a` to show all containers, stopped or otherwise, and get the contain ID or name.

```sh
chipzoller$ dps
CONTAINER ID        IMAGE                 COMMAND                 CREATED             STATUS              PORTS               NAMES
a3df64855465        vmware/powerclicore   "/usr/bin/powershell"   20 minutes ago      Up 6 seconds                            determined_davinci
```

The container ID here is a3df64855465, and the name provided (since we didn’t specify one at runtime) is called “determined_davinci”. We can use either of these to restart this container and get back into our PowerCLI session. In my case, the container ID begins with “a3”, so we can start the container up again with that. Let’s issue a `docker start a3` and then verify the container is up and running again with a `docker ps` command. If it’s running, we can re-attach to that container with a `docker attach a3` command.

```sh
chipzoller$ docker attach a3
PS /powershell>
```

And now we’re back to our PowerCLI session, so go fourth and PowerShell the masses with PowerCLI Core in a Docker container!
