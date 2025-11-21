sub error1(unusedParam) ' error
    a = 10
    print a
end sub

sub error2(unusedParamNoLocal) ' error
end sub

sub error3(a, b, c, unusedParamNoLocal) ' error
    if a then
        print "true"
    end if

    print b

    if c = "none" then
        print "none"
    end if
end sub

sub ok1(x)
    a = 8
    if a > x
        print a
    end if
end sub

sub ok2(_explicitlyUnused)
    a = 10
    print a
end sub

sub ok3(_explicitlyUnusedNoLocal)
end sub
