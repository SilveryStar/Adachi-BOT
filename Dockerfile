FROM centos:7

RUN (curl -sL https://rpm.nodesource.com/setup_12.x | bash -) \
    && yum clean all -y \
    && yum update -y \
    && yum install -y nodejs \
    && yum autoremove -y \
    && yum clean all -y \
    && npm install cnpm --global \
    && cnpm install forever --global


RUN yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y

COPY . /bot
WORKDIR /bot
RUN cnpm install
CMD [ "npm", "start" ]