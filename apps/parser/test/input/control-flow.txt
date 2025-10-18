let a = 0;
if (a > 1) {

}

if (1) {
    let b = 20; // should not be accessible to else block
}
elif (let b = 10) {
    a = b;
    let a = 25; // should warn
}
else {
    b = 2; // should error
}

do {}
while (a < 3); // maybe the ; should be replaced by an empty body???

while (b > 4) {
    if (a) {
        continue;
    }
} finally {
    return 1 + 2 + 3;
}
do {} while(true) {}