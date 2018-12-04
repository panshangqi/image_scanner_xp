#pragma once
#include <stdio.h>
#include <string>
#include <windows.h>
#include <locale.h> 
using namespace std;
class Unicode {
public:
	static std::wstring StringToWstring(const std::string str);
	static std::string WstringToString(const std::wstring str);
	static wchar_t* CharToWchart(const char *str);
	static char* WChartToChar(const wchar_t* wstr);
	static unsigned char ToHex(unsigned char x);
	static unsigned char FromHex(unsigned char x);
	static std::string UrlEncode(const std::string& str);
	static std::string UrlDecode(const std::string& str);
	static wchar_t* Unicode::TransToUnicode(const char * ch, int type = CP_ACP);
	static char* Unicode::TransFromUnicode(const wchar_t * wch, int type = CP_ACP);
	static string UrlFilter(string url);
	static char* Unicode::StringToUtf8(const char* ch);
};

