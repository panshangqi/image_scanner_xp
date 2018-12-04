#include "UnicodeUtf8.h"
// 需包含locale、string头文件、使用setlocale函数
// string转wstring
std::wstring Unicode:: StringToWstring(const std::string str)
{
	size_t len = str.size() * 2;// 预留字节数
	setlocale(LC_CTYPE, "");     //必须调用此函数
	wchar_t *p = new wchar_t[len];// 申请一段内存存放转换后的字符串
	mbstowcs(p, str.c_str(), len);// 转换
	std::wstring str1(p);
	delete[] p;// 释放申请的内存
	return str1;
}
// wstring转string
std::string Unicode::WstringToString(const std::wstring str)
{
	size_t len = str.size() * 4;
	setlocale(LC_CTYPE, "");
	char *p = new char[len];
	wcstombs(p, str.c_str(), len);
	std::string str1(p);
	delete[] p;
	return str1;
}

// char*转 wchar_t*
wchar_t* Unicode::CharToWchart(const char *str)
{
	size_t len = strlen(str) * 2;// 预留字节数
	setlocale(LC_CTYPE, "");     //必须调用此函数
	wchar_t *wstr = new wchar_t[len];// 申请一段内存存放转换后的字符串s
	mbstowcs(wstr, str, len);// 转换
	return wstr;
}
// wchar_t* 转 char*
char* Unicode::WChartToChar(const wchar_t* wstr)
{
	size_t len = wcsnlen(wstr,500) * 4;
	setlocale(LC_CTYPE, "");
	char *str = new char[len];
	wcstombs(str, wstr, len);
	return str;
}

// 当type为CP_ACP时，GBK转化为UNICODE；当type为CP_UTF8时，UTF8转化为UNICODE
wchar_t* Unicode::TransToUnicode(const char * ch, int type) {
	int len = MultiByteToWideChar(type, 0, ch, -1, nullptr, 0);
	wchar_t *str = new wchar_t[len + 1];
	wmemset(str, 0, len + 1);
	MultiByteToWideChar(type, 0, ch, -1, str, len);
	return str;
}
// 当type为CP_ACP时，UNICODE转化为GBK；当type为CP_UTF8时，UNICODE转化为UTF8
char* Unicode::TransFromUnicode(const wchar_t * wch, int type) {
	int len = WideCharToMultiByte(type, 0, wch, -1, nullptr, 0, nullptr, nullptr);
	char *str = new char[len + 1];
	memset(str, 0, len + 1);
	WideCharToMultiByte(type, 0, wch, -1, str, len, nullptr, nullptr);
	return str;
}

//字符串过滤中文
string Unicode::UrlFilter(string url)
{
	string temp = "";
	for (int i = 0; i < url.length(); i++)
	{
		if ((url[i] >= 'a'&& url[i] <= 'z') ||
			(url[i] >= 'A'&&url[i] <= 'Z') ||
			(url[i] >= '0'&&url[i] <= '9') ||
			url[i] == '_' || url[i] == '-')
			temp += url[i];
		else if (url[i] == ' ')
			temp += "+";
	}
	return temp;
}
unsigned char Unicode::ToHex(unsigned char x)
{
	return  x > 9 ? x + 55 : x + 48;
}

unsigned char Unicode::FromHex(unsigned char x)
{
	unsigned char y;
	if (x >= 'A' && x <= 'Z') y = x - 'A' + 10;
	else if (x >= 'a' && x <= 'z') y = x - 'a' + 10;
	else if (x >= '0' && x <= '9') y = x - '0';

	return y;
}

std::string Unicode::UrlEncode(const std::string& str)
{
	std::string strTemp = "";
	size_t length = str.length();
	for (size_t i = 0; i < length; i++)
	{
		if (isalnum((unsigned char)str[i]) || (str[i] == '-') || (str[i] == '_') || (str[i] == '.') || (str[i] == '~'))
			strTemp += str[i];
		else if (str[i] == ' ')
			strTemp += "+";
		else
		{
			strTemp += '%';
			strTemp += ToHex((unsigned char)str[i] >> 4);
			strTemp += ToHex((unsigned char)str[i] % 16);
		}
	}
	return strTemp;
}

std::string Unicode::UrlDecode(const std::string& str)
{
	std::string strTemp = "";
	size_t length = str.length();
	for (size_t i = 0; i < length; i++)
	{
		if (str[i] == '+') strTemp += ' ';
		else if (str[i] == '%')
		{
			if (i + 2 < length)
			{
				unsigned char high = FromHex((unsigned char)str[++i]);
				unsigned char low = FromHex((unsigned char)str[++i]);
				strTemp += high * 16 + low;
			}
		}
		else strTemp += str[i];
	}
	return strTemp;
}

char* Unicode::StringToUtf8(const char* ch){
    wchar_t *wchar = TransToUnicode(ch, CP_UTF8);
    return TransFromUnicode(wchar, CP_ACP);
}