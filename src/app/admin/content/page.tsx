
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { faqs as initialFaqs, pinCodeData as initialPinCodeData } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function ContentPage() {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [pinCodeData, setPinCodeData] = useState(initialPinCodeData);
  
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<{ question: string, answer: string, index?: number } | null>(null);

  const [isPinCodeDialogOpen, setIsPinCodeDialogOpen] = useState(false);
  const [currentPinCode, setCurrentPinCode] = useState<{ pincode: string, info: string, isEditing: boolean } | null>(null);

  const handleOpenFaqDialog = (faq: { question: string, answer: string } | null = null, index: number | undefined = undefined) => {
    setCurrentFaq(faq ? { ...faq, index } : { question: '', answer: '' });
    setIsFaqDialogOpen(true);
  };

  const handleSaveFaq = () => {
    if (!currentFaq) return;

    // In a real app, you would call an API to save this data.
    if (currentFaq.index !== undefined) {
      const updatedFaqs = [...faqs];
      updatedFaqs[currentFaq.index] = { question: currentFaq.question, answer: currentFaq.answer };
      setFaqs(updatedFaqs);
    } else {
      setFaqs([...faqs, { question: currentFaq.question, answer: currentFaq.answer }]);
    }
    
    setIsFaqDialogOpen(false);
    setCurrentFaq(null);
  };

  const handleOpenPinCodeDialog = (pincode: string | null = null, info: string | null = null) => {
    if (pincode && info) {
      setCurrentPinCode({ pincode, info, isEditing: true });
    } else {
      setCurrentPinCode({ pincode: '', info: '', isEditing: false });
    }
    setIsPinCodeDialogOpen(true);
  };

  const handleSavePinCode = () => {
    if (!currentPinCode) return;

    // In a real app, you would call an API to save this data.
    setPinCodeData(prev => ({
      ...prev,
      [currentPinCode.pincode]: currentPinCode.info
    }));

    setIsPinCodeDialogOpen(false);
    setCurrentPinCode(null);
  };

  return (
    <>
    <Tabs defaultValue="faq">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold">Content Management</h2>
            <p className="text-muted-foreground">Manage your chatbot's knowledge base.</p>
        </div>
        <TabsList>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="pincodes">PIN Codes</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="faq" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Add, edit, or remove FAQs to train your chatbot.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenFaqDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {faqs.map((faq, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{faq.question}</TableCell>
                            <TableCell className="text-muted-foreground">{faq.answer}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenFaqDialog(faq, index)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pincodes" className="mt-6">
         <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>PIN Code Information</CardTitle>
              <CardDescription>
                Manage the information associated with different PIN codes.
              </CardDescription>
            </div>
             <Button onClick={() => handleOpenPinCodeDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add PIN Code
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>PIN Code</TableHead>
                        <TableHead>Information</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(pinCodeData).map(([pincode, info]) => (
                        <TableRow key={pincode}>
                            <TableCell className="font-medium">{pincode}</TableCell>
                            <TableCell className="text-muted-foreground">{info}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenPinCodeDialog(pincode, info)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scripts" className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Custom Scripts</CardTitle>
                <CardDescription>
                Manage custom scripts and advanced chatbot responses. (Coming soon)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-12">
                    <p>This section is under construction.</p>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{currentFaq?.index !== undefined ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
          <DialogDescription>
            {currentFaq?.index !== undefined ? 'Update the question and answer.' : 'Enter a new question and its corresponding answer.'}
          </DialogDescription>
        </DialogHeader>
        {currentFaq && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Input 
                id="question" 
                value={currentFaq.question}
                onChange={(e) => setCurrentFaq({...currentFaq, question: e.target.value})}
                placeholder="What is...?" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer" 
                value={currentFaq.answer}
                onChange={(e) => setCurrentFaq({...currentFaq, answer: e.target.value})}
                placeholder="The answer is..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFaq}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isPinCodeDialogOpen} onOpenChange={setIsPinCodeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{currentPinCode?.isEditing ? 'Edit PIN Code' : 'Add New PIN Code'}</DialogTitle>
                <DialogDescription>
                    {currentPinCode?.isEditing ? 'Update the information for this PIN code.' : 'Enter a new PIN code and its associated information.'}
                </DialogDescription>
            </DialogHeader>
            {currentPinCode && (
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                            id="pincode"
                            value={currentPinCode.pincode}
                            onChange={(e) => setCurrentPinCode({ ...currentPinCode, pincode: e.target.value })}
                            placeholder="e.g., 110001"
                            disabled={currentPinCode.isEditing}
                            maxLength={6}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="info">Information</Label>
                        <Textarea
                            id="info"
                            value={currentPinCode.info}
                            onChange={(e) => setCurrentPinCode({ ...currentPinCode, info: e.target.value })}
                            placeholder="Historical, cultural, and geographical details..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPinCodeDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePinCode}>Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
